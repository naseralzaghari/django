from django.db import models
from django.core.validators import MinValueValidator


class Book(models.Model):
    """Book model for library management"""
    
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True, help_text='13-digit ISBN number')
    publisher = models.CharField(max_length=200, blank=True, null=True)
    publication_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    total_copies = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text='Total number of copies of this book'
    )
    available_copies = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        help_text='Number of copies currently available for borrowing'
    )
    pages = models.PositiveIntegerField(blank=True, null=True)
    language = models.CharField(max_length=50, default='English')
    cover_image = models.URLField(blank=True, null=True, help_text='URL to book cover image')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Book'
        verbose_name_plural = 'Books'
    
    def __str__(self):
        return f"{self.title} by {self.author}"
    
    def is_available(self):
        """Check if book is available for borrowing"""
        return self.available_copies > 0
    
    def save(self, *args, **kwargs):
        """Ensure available_copies doesn't exceed total_copies"""
        if self.available_copies > self.total_copies:
            self.available_copies = self.total_copies
        super().save(*args, **kwargs)

