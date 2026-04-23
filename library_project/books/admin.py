from django.contrib import admin
from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'category', 'total_copies', 'available_copies', 'is_available')
    list_filter = ('category', 'language', 'publication_date')
    search_fields = ('title', 'author', 'isbn', 'publisher', 'description')
    ordering = ['-created_at']
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'author', 'isbn', 'publisher', 'publication_date')
        }),
        ('Details', {
            'fields': ('description', 'category', 'pages', 'language', 'cover_image')
        }),
        ('Inventory', {
            'fields': ('total_copies', 'available_copies')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

