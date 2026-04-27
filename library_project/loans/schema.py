import graphene
from graphene_django import DjangoObjectType
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from .models import BookLoan
from books.models import Book
from users.permissions import login_required, admin_required
from users.schema import UserType
from books.schema import BookType
from .tasks import send_borrow_confirmation, send_return_confirmation


class BookLoanType(DjangoObjectType):
    """GraphQL type for BookLoan model"""
    days_until_due = graphene.Int()
    is_overdue = graphene.Boolean()
    
    class Meta:
        model = BookLoan
        fields = '__all__'
    
    def resolve_days_until_due(self, info):
        return self.days_until_due()
    
    def resolve_is_overdue(self, info):
        return self.is_overdue()


class BookLoanQuery(graphene.ObjectType):
    """GraphQL queries for Book Loans"""
    all_loans = graphene.List(BookLoanType)
    my_loans = graphene.List(BookLoanType)
    active_loans = graphene.List(BookLoanType)
    overdue_loans = graphene.List(BookLoanType)
    loan = graphene.Field(BookLoanType, id=graphene.Int())
    user_loan_history = graphene.List(BookLoanType, user_id=graphene.Int())
    
    @admin_required
    def resolve_all_loans(root, info):
        """Get all loans (admin only)"""
        return BookLoan.objects.all()
    
    @login_required
    def resolve_my_loans(root, info):
        """Get current user's loans"""
        return BookLoan.objects.filter(user=info.context.user)
    
    @admin_required
    def resolve_active_loans(root, info):
        """Get all active loans (admin only)"""
        return BookLoan.objects.filter(status='active')
    
    @admin_required
    def resolve_overdue_loans(root, info):
        """Get all overdue loans (admin only)"""
        return BookLoan.objects.filter(status='overdue')
    
    @login_required
    def resolve_loan(root, info, id):
        """Get a single loan by ID"""
        try:
            loan = BookLoan.objects.get(pk=id)
            # Regular users can only see their own loans
            if not info.context.user.is_admin() and loan.user != info.context.user:
                return None
            return loan
        except BookLoan.DoesNotExist:
            return None
    
    @admin_required
    def resolve_user_loan_history(root, info, user_id):
        """Get loan history for a specific user (admin only)"""
        return BookLoan.objects.filter(user_id=user_id)


class BorrowBook(graphene.Mutation):
    """Mutation to borrow a book (regular users and admins)"""
    class Arguments:
        book_id = graphene.Int(required=True)
        days = graphene.Int()  # Optional: number of days to borrow (default 14)
    
    loan = graphene.Field(BookLoanType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @login_required
    def mutate(root, info, book_id, days=14):
        try:
            user = info.context.user
            
            # Use transaction to ensure atomicity
            with transaction.atomic():
                # Lock the book row to prevent race conditions
                book = Book.objects.select_for_update().get(pk=book_id)
                
                # Check if book is available
                if book.available_copies <= 0:
                    return BorrowBook(
                        loan=None,
                        success=False,
                        message="Book is not available for borrowing"
                    )
                
                # Check if user already has an active loan for this book
                existing_loan = BookLoan.objects.filter(
                    user=user,
                    book=book,
                    status__in=['active', 'overdue']
                ).first()
                
                if existing_loan:
                    return BorrowBook(
                        loan=None,
                        success=False,
                        message="You already have an active loan for this book"
                    )
                
                # Create loan
                due_date = timezone.now() + timedelta(days=days)
                loan = BookLoan.objects.create(
                    user=user,
                    book=book,
                    due_date=due_date,
                    status='active'
                )
                
                # Update book availability
                book.available_copies -= 1
                book.save()
            
            # Send email notification asynchronously
            send_borrow_confirmation.delay(loan.id)
            
            return BorrowBook(
                loan=loan,
                success=True,
                message=f"Book borrowed successfully. Due date: {due_date.strftime('%Y-%m-%d')}"
            )
        except Book.DoesNotExist:
            return BorrowBook(
                loan=None,
                success=False,
                message="Book not found"
            )
        except Exception as e:
            return BorrowBook(
                loan=None,
                success=False,
                message=str(e)
            )


class ReturnBook(graphene.Mutation):
    """Mutation to return a borrowed book"""
    class Arguments:
        loan_id = graphene.Int(required=True)
        notes = graphene.String()
    
    loan = graphene.Field(BookLoanType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @login_required
    def mutate(root, info, loan_id, notes=None):
        try:
            user = info.context.user
            loan = BookLoan.objects.get(pk=loan_id)
            
            # Check permissions: user can return their own books, admin can return any
            if loan.user != user and not user.is_admin():
                return ReturnBook(
                    loan=None,
                    success=False,
                    message="You can only return your own borrowed books"
                )
            
            # Check if already returned
            if loan.status == 'returned':
                return ReturnBook(
                    loan=None,
                    success=False,
                    message="This book has already been returned"
                )
            
            # Use transaction to ensure atomicity
            with transaction.atomic():
                # Update loan
                loan.return_date = timezone.now()
                loan.status = 'returned'
                if notes:
                    loan.notes = notes
                loan.save()
                
                # Update book availability - lock to prevent race conditions
                book = Book.objects.select_for_update().get(pk=loan.book.id)
                book.available_copies += 1
                book.save()
            
            # Send return confirmation email asynchronously
            send_return_confirmation.delay(loan.id)
            
            return ReturnBook(
                loan=loan,
                success=True,
                message="Book returned successfully"
            )
        except BookLoan.DoesNotExist:
            return ReturnBook(
                loan=None,
                success=False,
                message="Loan not found"
            )
        except Exception as e:
            return ReturnBook(
                loan=None,
                success=False,
                message=str(e)
            )


class ExtendLoan(graphene.Mutation):
    """Mutation to extend a loan's due date"""
    class Arguments:
        loan_id = graphene.Int(required=True)
        additional_days = graphene.Int(required=True)
    
    loan = graphene.Field(BookLoanType)
    success = graphene.Boolean()
    message = graphene.String()
    
    @login_required
    def mutate(root, info, loan_id, additional_days):
        try:
            user = info.context.user
            loan = BookLoan.objects.get(pk=loan_id)
            
            # Check permissions
            if loan.user != user and not user.is_admin():
                return ExtendLoan(
                    loan=None,
                    success=False,
                    message="You can only extend your own loans"
                )
            
            # Check if already returned
            if loan.status == 'returned':
                return ExtendLoan(
                    loan=None,
                    success=False,
                    message="Cannot extend a returned loan"
                )
            
            # Extend due date
            loan.due_date = loan.due_date + timedelta(days=additional_days)
            if loan.status == 'overdue' and loan.due_date > timezone.now():
                loan.status = 'active'
            loan.save()
            
            return ExtendLoan(
                loan=loan,
                success=True,
                message=f"Loan extended by {additional_days} days"
            )
        except BookLoan.DoesNotExist:
            return ExtendLoan(
                loan=None,
                success=False,
                message="Loan not found"
            )
        except Exception as e:
            return ExtendLoan(
                loan=None,
                success=False,
                message=str(e)
            )


class BookLoanMutation(graphene.ObjectType):
    """GraphQL mutations for Book Loans"""
    borrow_book = BorrowBook.Field()
    return_book = ReturnBook.Field()
    extend_loan = ExtendLoan.Field()
