from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import User
from books.models import Book
from loans.models import BookLoan


class Command(BaseCommand):
    help = 'Populate database with sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting to populate database...'))
        
        # Create Users
        self.stdout.write('Creating users...')
        
        # Create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@library.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'user_type': 'admin',
                'phone': '+1234567890',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created admin user: {admin.username}'))
        else:
            self.stdout.write(self.style.WARNING(f'✓ Admin user already exists: {admin.username}'))
        
        # Create regular users
        regular_users = [
            {
                'username': 'john_doe',
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone': '+1234567891',
                'password': 'user123'
            },
            {
                'username': 'jane_smith',
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone': '+1234567892',
                'password': 'user123'
            },
            {
                'username': 'bob_wilson',
                'email': 'bob@example.com',
                'first_name': 'Bob',
                'last_name': 'Wilson',
                'phone': '+1234567893',
                'password': 'user123'
            }
        ]
        
        created_users = []
        for user_data in regular_users:
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'✓ Created regular user: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'✓ Regular user already exists: {user.username}'))
            created_users.append(user)
        
        # Create Books
        self.stdout.write('\nCreating books...')
        
        books_data = [
            {
                'title': 'The Great Gatsby',
                'author': 'F. Scott Fitzgerald',
                'isbn': '9780743273565',
                'publisher': 'Scribner',
                'description': 'A classic American novel set in the Jazz Age',
                'category': 'Fiction',
                'total_copies': 5,
                'available_copies': 5,
                'pages': 180,
                'language': 'English'
            },
            {
                'title': 'To Kill a Mockingbird',
                'author': 'Harper Lee',
                'isbn': '9780061120084',
                'publisher': 'Harper Perennial',
                'description': 'A gripping tale of racial injustice and childhood innocence',
                'category': 'Fiction',
                'total_copies': 4,
                'available_copies': 4,
                'pages': 324,
                'language': 'English'
            },
            {
                'title': '1984',
                'author': 'George Orwell',
                'isbn': '9780451524935',
                'publisher': 'Signet Classic',
                'description': 'A dystopian social science fiction novel',
                'category': 'Science Fiction',
                'total_copies': 6,
                'available_copies': 6,
                'pages': 328,
                'language': 'English'
            },
            {
                'title': 'Pride and Prejudice',
                'author': 'Jane Austen',
                'isbn': '9780141439518',
                'publisher': 'Penguin Classics',
                'description': 'A romantic novel of manners',
                'category': 'Romance',
                'total_copies': 3,
                'available_copies': 3,
                'pages': 432,
                'language': 'English'
            },
            {
                'title': 'The Catcher in the Rye',
                'author': 'J.D. Salinger',
                'isbn': '9780316769174',
                'publisher': 'Little, Brown and Company',
                'description': 'A story about teenage rebellion',
                'category': 'Fiction',
                'total_copies': 4,
                'available_copies': 4,
                'pages': 277,
                'language': 'English'
            },
            {
                'title': 'Harry Potter and the Philosopher\'s Stone',
                'author': 'J.K. Rowling',
                'isbn': '9780747532699',
                'publisher': 'Bloomsbury',
                'description': 'The first book in the Harry Potter series',
                'category': 'Fantasy',
                'total_copies': 8,
                'available_copies': 8,
                'pages': 223,
                'language': 'English'
            },
            {
                'title': 'The Hobbit',
                'author': 'J.R.R. Tolkien',
                'isbn': '9780547928227',
                'publisher': 'Houghton Mifflin',
                'description': 'A fantasy novel and children\'s book',
                'category': 'Fantasy',
                'total_copies': 5,
                'available_copies': 5,
                'pages': 310,
                'language': 'English'
            },
            {
                'title': 'Clean Code',
                'author': 'Robert C. Martin',
                'isbn': '9780132350884',
                'publisher': 'Prentice Hall',
                'description': 'A handbook of agile software craftsmanship',
                'category': 'Programming',
                'total_copies': 3,
                'available_copies': 3,
                'pages': 464,
                'language': 'English'
            }
        ]
        
        created_books = []
        for book_data in books_data:
            book, created = Book.objects.get_or_create(
                isbn=book_data['isbn'],
                defaults=book_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created book: {book.title}'))
            else:
                self.stdout.write(self.style.WARNING(f'✓ Book already exists: {book.title}'))
            created_books.append(book)
        
        # Create some sample loans
        self.stdout.write('\nCreating sample loans...')
        
        if created_users and created_books:
            # Active loan
            loan1, created = BookLoan.objects.get_or_create(
                user=created_users[0],
                book=created_books[0],
                defaults={
                    'due_date': timezone.now() + timedelta(days=10),
                    'status': 'active'
                }
            )
            if created:
                created_books[0].available_copies -= 1
                created_books[0].save()
                self.stdout.write(self.style.SUCCESS(f'✓ Created active loan for {created_users[0].username}'))
            
            # Overdue loan
            loan2, created = BookLoan.objects.get_or_create(
                user=created_users[1],
                book=created_books[1],
                defaults={
                    'borrowed_date': timezone.now() - timedelta(days=20),
                    'due_date': timezone.now() - timedelta(days=5),
                    'status': 'overdue'
                }
            )
            if created:
                created_books[1].available_copies -= 1
                created_books[1].save()
                self.stdout.write(self.style.SUCCESS(f'✓ Created overdue loan for {created_users[1].username}'))
            
            # Returned loan
            loan3, created = BookLoan.objects.get_or_create(
                user=created_users[2],
                book=created_books[2],
                defaults={
                    'borrowed_date': timezone.now() - timedelta(days=10),
                    'due_date': timezone.now() + timedelta(days=4),
                    'return_date': timezone.now() - timedelta(days=2),
                    'status': 'returned'
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created returned loan for {created_users[2].username}'))
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
        self.stdout.write('='*50)
        self.stdout.write('\n📚 Sample Data Summary:')
        self.stdout.write(f'  • Users: {User.objects.count()} total')
        self.stdout.write(f'    - Admins: {User.objects.filter(user_type="admin").count()}')
        self.stdout.write(f'    - Regular: {User.objects.filter(user_type="regular").count()}')
        self.stdout.write(f'  • Books: {Book.objects.count()} total')
        self.stdout.write(f'  • Active Loans: {BookLoan.objects.filter(status="active").count()}')
        self.stdout.write(f'  • Overdue Loans: {BookLoan.objects.filter(status="overdue").count()}')
        self.stdout.write('\n🔐 Test Credentials:')
        self.stdout.write('  Admin:')
        self.stdout.write('    Username: admin')
        self.stdout.write('    Password: admin123')
        self.stdout.write('  Regular Users:')
        self.stdout.write('    Username: john_doe, jane_smith, bob_wilson')
        self.stdout.write('    Password: user123 (for all)')
        self.stdout.write('\n🚀 GraphQL Endpoint: http://localhost:8000/graphql/')
        self.stdout.write('='*50)
