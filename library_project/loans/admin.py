from django.contrib import admin
from .models import BookLoan


@admin.register(BookLoan)
class BookLoanAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'borrowed_date', 'due_date', 'return_date', 'status', 'is_overdue')
    list_filter = ('status', 'borrowed_date', 'due_date')
    search_fields = ('user__username', 'user__email', 'book__title', 'book__isbn')
    ordering = ['-borrowed_date']
    readonly_fields = ('borrowed_date', 'created_at', 'updated_at', 'is_overdue', 'days_until_due')
    
    fieldsets = (
        ('Loan Information', {
            'fields': ('user', 'book', 'status')
        }),
        ('Dates', {
            'fields': ('borrowed_date', 'due_date', 'return_date')
        }),
        ('Status', {
            'fields': ('is_overdue', 'days_until_due', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

