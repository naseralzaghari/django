import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q
from .models import Book
from users.permissions import admin_required, login_required


class BookType(DjangoObjectType):
    """GraphQL type for Book model"""
    class Meta:
        model = Book
        fields = '__all__'


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
    
    book = graphene.Field(BookType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @admin_required
    def mutate(root, info, title, author, isbn, **kwargs):
        try:
            book = Book.objects.create(
                title=title,
                author=author,
                isbn=isbn,
                **kwargs
            )
            return CreateBook(book=book, success=True, message="Book created successfully")
        except Exception as e:
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
    
    book = graphene.Field(BookType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @admin_required
    def mutate(root, info, id, **kwargs):
        try:
            book = Book.objects.get(pk=id)
            for field, value in kwargs.items():
                if value is not None:
                    setattr(book, field, value)
            book.save()
            return UpdateBook(book=book, success=True, message="Book updated successfully")
        except Book.DoesNotExist:
            return UpdateBook(book=None, success=False, message="Book not found")
        except Exception as e:
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
            book.delete()
            return DeleteBook(success=True, message="Book deleted successfully")
        except Book.DoesNotExist:
            return DeleteBook(success=False, message="Book not found")
        except Exception as e:
            return DeleteBook(success=False, message=str(e))


class BookMutation(graphene.ObjectType):
    """GraphQL mutations for Books"""
    create_book = CreateBook.Field()
    update_book = UpdateBook.Field()
    delete_book = DeleteBook.Field()
