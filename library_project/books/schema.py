import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q
from graphql import GraphQLError
from .models import Book
from users.permissions import admin_required, login_required
from core.storage import generate_presigned_url, upload_file_to_s3, delete_file_from_s3
import logging

logger = logging.getLogger(__name__)


class BookType(DjangoObjectType):
    """GraphQL type for Book model"""
    pdf_url = graphene.String()
    pdf_download_url = graphene.String()
    has_pdf = graphene.Boolean()
    
    class Meta:
        model = Book
        fields = '__all__'
    
    def resolve_pdf_url(self, info):
        """Generate presigned URL for viewing PDF inline"""
        if self.pdf_file:
            return generate_presigned_url(
                self.pdf_file.name,
                content_disposition='inline',
                content_type='application/pdf',
            )
        return None

    def resolve_pdf_download_url(self, info):
        """Generate presigned URL for downloading PDF"""
        if self.pdf_file:
            return generate_presigned_url(
                self.pdf_file.name,
                content_disposition='attachment',
                content_type='application/pdf',
            )
        return None
    
    def resolve_has_pdf(self, info):
        """Check if book has PDF attached"""
        return bool(self.pdf_file)


class BookQuery(graphene.ObjectType):
    """GraphQL queries for Books"""
    all_books = graphene.List(BookType)
    book = graphene.Field(BookType, id=graphene.Int())
    books_by_author = graphene.List(BookType, author=graphene.String(required=True))
    books_by_category = graphene.List(BookType, category=graphene.String(required=True))
    search_books = graphene.List(BookType, search=graphene.String(required=True))
    available_books = graphene.List(BookType)
    
    def resolve_all_books(root, info):
        """Get all books (accessible to all authenticated users)"""
        return Book.objects.all()
    
    def resolve_book(root, info, id):
        """Get a single book by ID"""
        try:
            return Book.objects.get(pk=id)
        except Book.DoesNotExist:
            return None
    
    def resolve_books_by_author(root, info, author):
        """Get books by author name"""
        return Book.objects.filter(author__icontains=author)
    
    def resolve_books_by_category(root, info, category):
        """Get books by category"""
        return Book.objects.filter(category__icontains=category)
    
    def resolve_search_books(root, info, search):
        """Search books by title, author, ISBN, or description"""
        return Book.objects.filter(
            Q(title__icontains=search) |
            Q(author__icontains=search) |
            Q(isbn__icontains=search) |
            Q(description__icontains=search)
        )
    
    def resolve_available_books(root, info):
        """Get all books that are currently available"""
        return Book.objects.filter(available_copies__gt=0)


class CreateBook(graphene.Mutation):
    """Mutation to create a new book (admin only)"""
    class Arguments:
        title = graphene.String(required=True)
        author = graphene.String(required=True)
        isbn = graphene.String(required=True)
        publisher = graphene.String()
        publication_date = graphene.Date()
        description = graphene.String()
        category = graphene.String()
        total_copies = graphene.Int()
        available_copies = graphene.Int()
        pages = graphene.Int()
        language = graphene.String()
        cover_image = graphene.String()
        pdf_file = graphene.String()  # Base64 encoded PDF or file path
    
    book = graphene.Field(BookType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @admin_required
    def mutate(root, info, title, author, isbn, **kwargs):
        try:
            # Extract PDF file if provided
            pdf_file = kwargs.pop('pdf_file', None)
            
            # Create book instance
            book = Book.objects.create(
                title=title,
                author=author,
                isbn=isbn,
                **kwargs
            )
            
            # Handle PDF upload if provided
            if pdf_file:
                try:
                    # Handle file from request
                    files = info.context.FILES
                    if 'pdf_file' in files:
                        uploaded_file = files['pdf_file']
                        
                        # Validate file size (100MB)
                        if uploaded_file.size > 104857600:
                            book.delete()
                            return CreateBook(book=None, success=False, 
                                           message="PDF file size exceeds 100MB limit")
                        
                        # Validate file type
                        if not uploaded_file.name.lower().endswith('.pdf'):
                            book.delete()
                            return CreateBook(book=None, success=False, 
                                           message="Only PDF files are allowed")
                        
                        # Upload to S3
                        file_key = upload_file_to_s3(uploaded_file, folder='books', object_id=book.id, content_type='application/pdf')
                        if file_key:
                            book.pdf_file = file_key
                            book.save()
                            logger.info(f"PDF uploaded for book {book.id}: {file_key}")
                        else:
                            logger.warning(f"Failed to upload PDF for book {book.id}")
                except Exception as e:
                    logger.error(f"Error handling PDF upload: {e}")
                    # Don't fail book creation if PDF upload fails
            
            return CreateBook(book=book, success=True, message="Book created successfully")
        except Exception as e:
            logger.error(f"Error creating book: {e}")
            return CreateBook(book=None, success=False, message=str(e))


class UpdateBook(graphene.Mutation):
    """Mutation to update a book (admin only)"""
    class Arguments:
        id = graphene.Int(required=True)
        title = graphene.String()
        author = graphene.String()
        isbn = graphene.String()
        publisher = graphene.String()
        publication_date = graphene.Date()
        description = graphene.String()
        category = graphene.String()
        total_copies = graphene.Int()
        available_copies = graphene.Int()
        pages = graphene.Int()
        language = graphene.String()
        cover_image = graphene.String()
        pdf_file = graphene.String()  # For PDF updates
    
    book = graphene.Field(BookType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @admin_required
    def mutate(root, info, id, **kwargs):
        try:
            book = Book.objects.get(pk=id)
            
            # Extract PDF file if provided
            pdf_file = kwargs.pop('pdf_file', None)
            
            # Update regular fields
            for field, value in kwargs.items():
                if value is not None:
                    setattr(book, field, value)
            
            # Handle PDF upload if provided
            if pdf_file:
                try:
                    files = info.context.FILES
                    if 'pdf_file' in files:
                        uploaded_file = files['pdf_file']
                        
                        # Validate file size (100MB)
                        if uploaded_file.size > 104857600:
                            return UpdateBook(book=None, success=False, 
                                           message="PDF file size exceeds 100MB limit")
                        
                        # Validate file type
                        if not uploaded_file.name.lower().endswith('.pdf'):
                            return UpdateBook(book=None, success=False, 
                                           message="Only PDF files are allowed")
                        
                        # Delete old PDF if exists
                        if book.pdf_file:
                            delete_file_from_s3(book.pdf_file)

                        # Upload new PDF to S3
                        file_key = upload_file_to_s3(uploaded_file, folder='books', object_id=book.id, content_type='application/pdf')
                        if file_key:
                            book.pdf_file = file_key
                            logger.info(f"PDF updated for book {book.id}: {file_key}")
                        else:
                            logger.warning(f"Failed to upload PDF for book {book.id}")
                except Exception as e:
                    logger.error(f"Error handling PDF update: {e}")
                    # Don't fail book update if PDF upload fails
            
            book.save()
            return UpdateBook(book=book, success=True, message="Book updated successfully")
        except Book.DoesNotExist:
            return UpdateBook(book=None, success=False, message="Book not found")
        except Exception as e:
            logger.error(f"Error updating book: {e}")
            return UpdateBook(book=None, success=False, message=str(e))


class DeleteBook(graphene.Mutation):
    """Mutation to delete a book (admin only)"""
    class Arguments:
        id = graphene.Int(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    @admin_required
    def mutate(root, info, id):
        try:
            book = Book.objects.get(pk=id)
            
            # Delete PDF from S3 if exists
            if book.pdf_file:
                delete_file_from_s3(book.pdf_file)
            
            book.delete()
            return DeleteBook(success=True, message="Book deleted successfully")
        except Book.DoesNotExist:
            return DeleteBook(success=False, message="Book not found")
        except Exception as e:
            logger.error(f"Error deleting book: {e}")
            return DeleteBook(success=False, message=str(e))


class BookMutation(graphene.ObjectType):
    """GraphQL mutations for Books"""
    create_book = CreateBook.Field()
    update_book = UpdateBook.Field()
    delete_book = DeleteBook.Field()
