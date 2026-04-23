from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom User model with role-based access"""
    
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('regular', 'Regular User'),
    )
    
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='regular',
        help_text='User role: admin has full CRUD access, regular can only view and borrow books'
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    def is_admin(self):
        """Check if user is an admin"""
        return self.user_type == 'admin'
    
    def is_regular_user(self):
        """Check if user is a regular user"""
        return self.user_type == 'regular'

