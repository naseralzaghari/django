# Git Quick Reference

## 📋 Common Commands

### Check Status
```bash
git status                    # See what's changed
git log --oneline            # View commit history
git log --graph --oneline    # Visual commit history
```

### Making Changes

```bash
# Stage specific files
git add <filename>

# Stage all changes
git add .

# Commit with message
git commit -m "Your descriptive message"

# Add and commit in one step
git commit -am "Message"     # Only for tracked files
```

### Viewing Changes

```bash
git diff                     # See unstaged changes
git diff --staged           # See staged changes
git show                    # Show last commit details
```

### Branching

```bash
# Create and switch to new branch
git checkout -b feature-name

# Switch branches
git checkout main
git checkout feature-name

# List branches
git branch

# Delete branch
git branch -d feature-name
```

### Undo Changes

```bash
# Unstage file (keep changes)
git reset HEAD <filename>

# Discard changes in file
git checkout -- <filename>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) ⚠️
git reset --hard HEAD~1
```

### Remote Repository (GitHub/GitLab)

```bash
# Add remote
git remote add origin <repository-url>

# Push to remote
git push -u origin main      # First time
git push                     # Subsequent times

# Pull from remote
git pull origin main

# Clone repository
git clone <repository-url>
```

---

## 🎯 Your Current Setup

**Repository:** `/home/naseralzaghari/Desktop/django/`

**Structure:**
```
django/
├── .git/              # Git history (hidden)
├── .gitignore         # Files to ignore
├── README.md          # Project documentation
├── library_project/   # Django backend
└── react_app/         # React frontend
```

**Current Branch:** `main`

---

## 📝 Recommended Workflow

### 1. Working on a New Feature

```bash
# Create feature branch
git checkout -b feature/add-rating-system

# Make your changes...
# Edit files, test, etc.

# Check what changed
git status
git diff

# Stage changes
git add .

# Commit
git commit -m "feat: Add book rating system"

# Switch back to main
git checkout main

# Merge feature (if ready)
git merge feature/add-rating-system
```

### 2. Daily Work

```bash
# Start of day - make sure you're up to date
git pull

# Make changes throughout the day
git add <files>
git commit -m "Descriptive message"

# End of day - push to remote
git push
```

### 3. Before Making Changes

```bash
# Always check where you are
git status
git branch

# Make sure you're on the right branch
git checkout main  # or your feature branch
```

---

## 🏷️ Commit Message Conventions

### Format
```
<type>: <description>

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring (no feature change)
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
git commit -m "feat: Add user registration endpoint"
git commit -m "fix: Resolve login token expiration issue"
git commit -m "docs: Update API documentation"
git commit -m "refactor: Simplify book search logic"
```

---

## 🔄 Syncing with Remote (GitHub)

After creating a GitHub repository:

```bash
# Add remote
git remote add origin https://github.com/yourusername/library-management.git

# Push to GitHub
git push -u origin main

# After initial push, just use
git push
```

---

## 🚨 Common Scenarios

### "I need to undo my last commit"
```bash
git reset --soft HEAD~1    # Keeps changes
```

### "I want to see what changed in a file"
```bash
git diff library_project/books/models.py
```

### "I accidentally committed to main instead of a branch"
```bash
# Create branch with current changes
git branch feature-name

# Reset main
git reset --hard origin/main

# Switch to feature
git checkout feature-name
```

### "I want to stash changes temporarily"
```bash
# Save changes and clean working directory
git stash

# List stashed changes
git stash list

# Apply stashed changes
git stash pop
```

---

## 💡 Pro Tips

1. **Commit often** - Small, atomic commits are better than large ones
2. **Write clear messages** - Your future self will thank you
3. **Use branches** - Never work directly on main for features
4. **Pull before push** - Avoid conflicts
5. **Review before committing** - Use `git status` and `git diff`

---

## 📚 What's Ignored (from .gitignore)

- Python cache (`__pycache__`, `*.pyc`)
- Virtual environments (`venv/`, `env/`)
- Environment files (`.env`)
- Database files (`db.sqlite3`)
- Logs (`*.log`)
- Node modules (`node_modules/`)
- Build files (`build/`, `dist/`)
- IDE files (`.vscode/`, `.idea/`)

---

## 🎓 Next Steps

1. **Create GitHub repository** (optional)
2. **Push to remote** (if using GitHub)
3. **Create feature branches** for new work
4. **Commit regularly** as you develop

**Current status:** ✅ Git repository initialized and ready to use!
