# Celery + Redis Setup Guide

## What We Added

### 1. Docker Services
- **Redis**: Message broker for Celery (lightweight, in-memory storage)
- **Celery Worker**: Processes async tasks (email notifications)
- **Celery Beat**: Scheduler for periodic tasks (daily overdue checks)

### 2. Python Packages
- `celery==5.3.6`: Task queue system
- `redis==5.0.1`: Redis Python client

### 3. Celery Tasks Created
Located in `loans/tasks.py`:
- `send_borrow_confirmation`: Email when book is borrowed
- `send_return_confirmation`: Email when book is returned
- `check_overdue_books`: Daily task to check for overdue books (9 AM)
- `test_task`: Simple test to verify Celery works

### 4. Integration Points
Modified `loans/schema.py`:
- `BorrowBook` mutation → calls `send_borrow_confirmation.delay(loan.id)`
- `ReturnBook` mutation → calls `send_return_confirmation.delay(loan.id)`

## How to Run

### 1. Rebuild the containers
```bash
cd library_project
docker compose down
docker compose build
docker compose up
```

### 2. Watch the logs
Open separate terminals:

**Terminal 1 - Django:**
```bash
docker compose logs -f web
```

**Terminal 2 - Celery Worker:**
```bash
docker compose logs -f celery
```

**Terminal 3 - Celery Beat:**
```bash
docker compose logs -f celery-beat
```

## Testing

### Test 1: Borrow a Book
1. Go to your React app
2. Borrow a book
3. Check Celery worker logs - you should see:
   ```
   [CELERY] Borrow confirmation email for loan #X:
   Hello username,
   You have successfully borrowed: Book Title
   ...
   ```

### Test 2: Return a Book
1. Return a borrowed book
2. Check Celery worker logs for return confirmation

### Test 3: Manual Task Test
```bash
# Enter Django shell
docker compose exec web python manage.py shell

# Run test task
from loans.tasks import test_task
result = test_task.delay("Hello from Celery!")

# Check if task succeeded
result.ready()  # Returns True if completed
result.result   # Returns the task result
```

### Test 4: Check Overdue Books (Periodic Task)
The `check_overdue_books` task runs automatically at 9 AM daily.

To test manually:
```bash
docker compose exec web python manage.py shell

from loans.tasks import check_overdue_books
check_overdue_books.delay()
```

## Current Setup (For Learning)

**Email notifications are LOGGED, not sent:**
- No SMTP configuration needed
- Tasks just print to logs (visible in `docker compose logs -f celery`)
- Perfect for learning how Celery works

**To enable real emails later:**
1. Configure SMTP in `settings.py`
2. Uncomment `send_mail()` in `loans/tasks.py`

## Architecture

```
User Action (GraphQL)
    ↓
Django Mutation
    ↓
Task Added to Redis Queue  ← .delay()
    ↓
Celery Worker Picks Up Task
    ↓
Task Executed (logs printed)
    ↓
Result Stored in Redis
```

## Useful Commands

```bash
# Check Redis connection
docker compose exec redis redis-cli ping

# View all tasks in queue
docker compose exec web python manage.py shell
>>> from library_project.celery import app
>>> app.control.inspect().active()

# Restart Celery worker
docker compose restart celery

# View Celery worker status
docker compose exec celery celery -A library_project inspect active
```

## What Happens Now

1. ✅ User borrows book → Django returns success immediately
2. ✅ Celery picks up email task in background
3. ✅ Email notification logged (visible in celery container logs)
4. ✅ User doesn't wait for slow email operation

**Result:** Faster response time, better user experience!
