# Gmail SMTP Setup Guide

## Overview
Your Celery email tasks are now configured to send **actual emails** via Gmail's SMTP server.

---

## Step 1: Enable Gmail App Password

Gmail requires an **App Password** (not your regular Gmail password) when using SMTP.

### Instructions:

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the steps to enable it

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Or search "App Passwords" in your Google Account settings
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Library System"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

> **Note:** Remove spaces from the app password when copying to `.env`

---

## Step 2: Configure Environment Variables

Create/edit `.env` file in `library_project/` directory:

```bash
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
DEFAULT_FROM_EMAIL=Library System <your-email@gmail.com>
```

**Replace:**
- `your-email@gmail.com` → Your actual Gmail address
- `abcdefghijklmnop` → Your 16-character App Password (no spaces)

---

## Step 3: Restart Docker Containers

```bash
cd library_project
docker compose down
docker compose up --build
```

---

## Step 4: Test Email Sending

### Method 1: Borrow a Book
1. Log into your React app
2. Borrow a book
3. Check your Gmail inbox for confirmation email

### Method 2: Manual Test via Shell
```bash
docker compose exec web python manage.py shell

# Test task directly
from loans.tasks import test_task
test_task.delay("Testing email system!")

# Test borrow confirmation (if you have loan #1)
from loans.tasks import send_borrow_confirmation
send_borrow_confirmation.delay(1)
```

### Method 3: Django Send Mail Test
```bash
docker compose exec web python manage.py shell

from django.core.mail import send_mail
send_mail(
    subject='Test Email',
    message='This is a test from Library System',
    from_email='Library System <your-email@gmail.com>',
    recipient_list=['your-email@gmail.com'],
    fail_silently=False,
)
```

---

## Verification

### Check Celery Worker Logs:
```bash
docker compose logs -f celery
```

**Expected output (success):**
```
[CELERY] Borrow confirmation email for loan #X:
<email message content>
```

**If error, you'll see:**
```
SMTPAuthenticationError: Username and Password not accepted
```

---

## Troubleshooting

### Error: "Username and Password not accepted"
**Solutions:**
1. Make sure 2FA is enabled on your Gmail account
2. Make sure you're using **App Password**, not your regular Gmail password
3. Remove spaces from the App Password
4. Check that `EMAIL_HOST_USER` is your full Gmail address

### Error: "SMTPServerDisconnected"
**Solutions:**
1. Check `EMAIL_PORT` is `587`
2. Check `EMAIL_USE_TLS` is `True`
3. Make sure your network allows outbound SMTP connections

### Emails Not Arriving
**Check:**
1. Gmail inbox (not spam)
2. Recipient email address in user model is correct
3. Celery worker logs for errors: `docker compose logs celery`

### Test Basic SMTP Connection
```bash
docker compose exec web python manage.py shell

from django.core.mail import get_connection
conn = get_connection()
conn.open()  # Should return True if connection successful
conn.close()
```

---

## Email Notifications Configured

Your system now sends emails for:

1. **Borrow Confirmation** ✉️
   - Triggered when user borrows a book
   - Includes book title and due date

2. **Return Confirmation** ✉️
   - Triggered when user returns a book
   - Includes thank you message

3. **Overdue Reminders** ⏰
   - Runs daily at 9 AM (Celery Beat)
   - Emails users with overdue books

---

## Alternative: Console Backend (Development)

If you don't want to configure Gmail yet, emails will print to console:

**Remove email variables from `.env`:**
```bash
# Comment out or remove these:
# EMAIL_HOST_USER=...
# EMAIL_HOST_PASSWORD=...
```

**Check settings.py:**
```python
# This automatically switches to console backend when EMAIL_HOST_USER is not set
if DEBUG and not EMAIL_HOST_USER:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

**View emails in Django logs:**
```bash
docker compose logs -f web
```

---

## Security Notes

- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use App Password, not your Gmail password
- ✅ Keep App Password secret
- ⚠️ For production, consider using services like SendGrid, Mailgun, or AWS SES
- ⚠️ Gmail has sending limits (500 emails/day for free accounts)

---

## Production Alternatives

For production deployments, consider:

1. **SendGrid** (12k emails/month free)
2. **Mailgun** (1k emails/month free)
3. **AWS SES** (62k emails/month free with EC2)
4. **Mailjet**
5. **Postmark**

These services offer better deliverability, analytics, and higher sending limits.
