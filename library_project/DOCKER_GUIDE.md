# Docker Commands Reference

## Development Setup (Current - Recommended for Learning)

### Start everything
```bash
docker-compose up --build
```

### Start in background
```bash
docker-compose up -d --build
```

### View logs
```bash
docker-compose logs -f web
```

### Stop everything
```bash
docker-compose down
```

### Restart just the web service
```bash
docker-compose restart web
```

### Run Django commands inside container
```bash
# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Populate sample data
docker-compose exec web python manage.py populate_data

# Open Django shell
docker-compose exec web python manage.py shell
```

### Access database
```bash
docker-compose exec db psql -U library_user -d library_db
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### View running containers
```bash
docker-compose ps
```

### Remove everything (including volumes)
```bash
docker-compose down -v
```

---

## Production Setup

### Build and start
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### View logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Stop
```bash
docker-compose -f docker-compose.prod.yml down
```

---

## Useful Commands

### SSH into container
```bash
docker-compose exec web bash
```

### Check container resource usage
```bash
docker stats
```

### Clean up unused Docker resources
```bash
docker system prune -a
```

### View all containers (including stopped)
```bash
docker ps -a
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs web

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database connection issues
```bash
# Check if DB is healthy
docker-compose ps
docker-compose logs db

# Restart database
docker-compose restart db
```

### Port already in use
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process or change port in docker-compose.yml
```

---

## Current Setup

### Development (docker-compose.yml)
- **Web**: http://localhost:8000
- **GraphQL**: http://localhost:8000/graphql/
- **Admin**: http://localhost:8000/admin/
- **DB**: localhost:5433 (from host machine)

### Access from host machine
You can still run commands locally:
```bash
python manage.py shell
```

Or use Docker:
```bash
docker-compose exec web python manage.py shell
```

---

## Which Setup to Use?

### Use Regular Setup (No Docker for Django) If:
- ✅ Learning Django for the first time
- ✅ Rapid development with frequent code changes
- ✅ Using IDE features (debugging, autocomplete)
- ✅ Only working on your local machine

### Use Full Docker Setup If:
- ✅ Deploying to production
- ✅ Working in a team
- ✅ Need consistent environment across machines
- ✅ Planning to deploy to cloud (AWS, DigitalOcean, etc.)
- ✅ Want to avoid "works on my machine" issues

### Current Recommendation for You:
**Keep using your current setup** (Django locally, only DB in Docker) because:
1. You're learning
2. Faster iteration
3. Better IDE integration
4. Easier debugging

**Switch to full Docker** when:
1. Ready to deploy
2. Working with others
3. Moving to production
