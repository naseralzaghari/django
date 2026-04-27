from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task(name='loans.tasks.send_borrow_confirmation')
def send_borrow_confirmation(loan_id):
    """
    Send email confirmation when a book is borrowed.
    For learning purposes, we'll just log instead of actually sending email.
    """
    from loans.models import BookLoan
    
    try:
        loan = BookLoan.objects.select_related('user', 'book').get(id=loan_id)
        
        # For learning: just log the email (no actual SMTP setup needed)
        message = f"""
        Hello {loan.user.first_name or loan.user.username},
        
        You have successfully borrowed: {loan.book.title}
        Due date: {loan.due_date.strftime('%Y-%m-%d')}
        
        Please return the book on time to avoid late fees.
        
        Thank you!
        Library Management System
        """
        
        logger.info(f"[CELERY] Borrow confirmation email for loan #{loan_id}:")
        logger.info(message)
        
        # Send actual email
        send_mail(
            subject=f'Book Borrowed: {loan.book.title}',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[loan.user.email],
            fail_silently=False,
        )
        
        return f"Borrow confirmation sent for loan #{loan_id}"
    
    except BookLoan.DoesNotExist:
        logger.error(f"[CELERY] Loan #{loan_id} not found")
        return f"Loan #{loan_id} not found"
    except Exception as e:
        logger.error(f"[CELERY] Error sending borrow confirmation: {str(e)}")
        raise


@shared_task(name='loans.tasks.send_return_confirmation')
def send_return_confirmation(loan_id):
    """
    Send email confirmation when a book is returned.
    """
    from loans.models import BookLoan
    
    try:
        loan = BookLoan.objects.select_related('user', 'book').get(id=loan_id)
        
        message = f"""
        Hello {loan.user.first_name or loan.user.username},
        
        Thank you for returning: {loan.book.title}
        Returned on: {loan.return_date.strftime('%Y-%m-%d') if loan.return_date else 'N/A'}
        
        We hope you enjoyed the book!
        
        Thank you!
        Library Management System
        """
        
        logger.info(f"[CELERY] Return confirmation email for loan #{loan_id}:")
        logger.info(message)
        
        # Send actual email
        send_mail(
            subject=f'Book Returned: {loan.book.title}',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[loan.user.email],
            fail_silently=False,
        )
        
        return f"Return confirmation sent for loan #{loan_id}"
    
    except BookLoan.DoesNotExist:
        logger.error(f"[CELERY] Loan #{loan_id} not found")
        return f"Loan #{loan_id} not found"
    except Exception as e:
        logger.error(f"[CELERY] Error sending return confirmation: {str(e)}")
        raise


@shared_task(name='loans.tasks.check_overdue_books')
def check_overdue_books():
    """
    Periodic task to check for overdue books and send reminders.
    Scheduled to run daily at 9 AM (configured in settings.py)
    """
    from loans.models import BookLoan
    
    try:
        # Find all overdue loans (past due date and not returned)
        overdue_loans = BookLoan.objects.filter(
            due_date__lt=timezone.now(),
            return_date__isnull=True
        ).select_related('user', 'book')
        
        count = 0
        for loan in overdue_loans:
            days_overdue = (timezone.now().date() - loan.due_date.date()).days
            
            message = f"""
            Hello {loan.user.first_name or loan.user.username},
            
            OVERDUE REMINDER:
            
            Book: {loan.book.title}
            Due date: {loan.due_date.strftime('%Y-%m-%d')}
            Days overdue: {days_overdue}
            
            Please return the book as soon as possible to avoid additional late fees.
            
            Thank you!
            Library Management System
            """
            
            logger.warning(f"[CELERY] Overdue reminder for loan #{loan.id} ({days_overdue} days overdue):")
            logger.warning(message)
            
            # Send actual email
            send_mail(
                subject=f'OVERDUE: {loan.book.title}',
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[loan.user.email],
                fail_silently=False,
            )
            count += 1
        
        logger.info(f"[CELERY] Processed {count} overdue book reminders")
        return f"Sent reminders for {count} overdue books"
    
    except Exception as e:
        logger.error(f"[CELERY] Error checking overdue books: {str(e)}")
        raise


@shared_task(name='loans.tasks.test_task')
def test_task(message):
    """
    Simple test task to verify Celery is working.
    """
    logger.info(f"[CELERY TEST] {message}")
    return f"Task completed: {message}"
