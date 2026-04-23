from django.db import models
from django.conf import settings
from books.models import Book
from datetime import timedelta
from django.utils import timezone


class BookLoan(models.Model):
    """Model to track book borrowing and returns"""
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='loans'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='loans'
    )
    borrowed_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-borrowed_date']
        verbose_name = 'Book Loan'
        verbose_name_plural = 'Book Loans'
    
    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.status})"
    
    def save(self, *args, **kwargs):
        """Set due date if not provided (14 days from borrow)"""
        if not self.due_date:
            self.due_date = timezone.now() + timedelta(days=14)
        
        # Update status to overdue if past due date and not returned
        if self.status == 'active' and timezone.now() > self.due_date:
            self.status = 'overdue'
        
        super().save(*args, **kwargs)
    
    def is_overdue(self):
        """Check if the loan is overdue"""
        if self.status == 'returned':
            return False
        return timezone.now() > self.due_date
    
    def days_until_due(self):
        """Calculate days until due date"""
        if self.status == 'returned':
            return 0
        delta = self.due_date - timezone.now()
        return delta.days

