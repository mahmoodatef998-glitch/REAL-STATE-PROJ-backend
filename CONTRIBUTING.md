# 🤝 Contributing to AL RABEI Real Estate Backend

Thank you for your interest in contributing to AL RABEI Real Estate Backend! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

### Our Standards

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers
- ✅ Give and accept constructive feedback gracefully
- ✅ Focus on what's best for the project
- ❌ No harassment or discriminatory behavior
- ❌ No trolling or insulting comments

---

## 🚀 Getting Started

### Prerequisites

Before you start contributing, make sure you have:

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Git
- A code editor (VS Code recommended)
- Basic knowledge of:
  - JavaScript/Node.js
  - Express.js
  - PostgreSQL
  - REST APIs
  - Git

---

## 💻 Development Setup

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/al-rabei-real-estate.git
cd al-rabei-real-estate/backend
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/al-rabei-real-estate.git
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Environment

```bash
cp config.env.example config.env
# Edit config.env with your local configuration
```

### 6. Set Up Database

```bash
# Create database
createdb al_rabei_real_estate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run seed
```

### 7. Start Development Server

```bash
npm run dev
```

The server should start on `http://localhost:3050`

---

## 🎯 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/OWNER/REPO/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue with:
   - Clear title and description
   - Use case and benefits
   - Possible implementation approach
   - Any alternatives considered

### Making Code Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow coding standards
   - Add/update tests
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

---

## 📝 Coding Standards

### General Guidelines

- Use **ES6+** features
- Use **async/await** for asynchronous code
- Keep functions **small and focused**
- Write **self-documenting code**
- Add comments for complex logic
- Follow **DRY** principle (Don't Repeat Yourself)

### File Structure

```javascript
// 1. Imports (external first, then internal)
const express = require('express');
const jwt = require('jsonwebtoken');
const { getJWTSecret } = require('../utils/jwtHelper');

// 2. Constants
const SALT_ROUNDS = 10;

// 3. Main logic
class UserService {
  // ...
}

// 4. Exports
module.exports = UserService;
```

### Naming Conventions

```javascript
// Variables and functions: camelCase
const userName = 'John';
function getUserById(id) { }

// Classes: PascalCase
class UserService { }

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Private functions: _camelCase
function _validateInput() { }

// Boolean variables: is/has prefix
const isActive = true;
const hasPermission = false;
```

### Error Handling

```javascript
// Use try-catch for async operations
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', { error: error.message });
  throw new APIError(ERROR_CODES.SERVER_ERROR);
}

// Use APIError for known errors
if (!user) {
  throw new APIError(ERROR_CODES.AUTH_USER_NOT_FOUND);
}
```

### Code Formatting

- **Indentation:** 2 spaces (no tabs)
- **Line length:** Maximum 100 characters
- **Semicolons:** Required
- **Quotes:** Single quotes for strings
- **Trailing commas:** Use them

---

## 📋 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(api): resolve CORS issue in production"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(models): simplify User model structure"
```

### Breaking Changes

```bash
git commit -m "feat(api): change authentication endpoint

BREAKING CHANGE: /api/login endpoint now returns different response format"
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass (`npm test`)
- [ ] Added tests for new features
- [ ] Updated documentation
- [ ] Commit messages follow guidelines
- [ ] No merge conflicts with main branch
- [ ] Updated CHANGELOG.md (for significant changes)

### PR Title Format

Follow the same format as commits:

```
feat(auth): add two-factor authentication
fix(api): resolve memory leak in property routes
docs: update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass
```

### Review Process

1. At least one maintainer must review
2. All comments must be addressed
3. CI checks must pass
4. No merge conflicts
5. Approved by maintainer

---

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific test file
npm test -- auth.test.js
```

### Writing Tests

```javascript
describe('User Authentication', () => {
  it('should register new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Test Coverage Requirements

- Minimum 70% coverage for new code
- Critical paths must be 100% covered
- All edge cases should be tested

---

## 📚 Documentation

### Code Documentation

```javascript
/**
 * Create a new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @returns {Promise<User>} Created user object
 * @throws {APIError} If email already exists
 */
async function createUser(userData) {
  // Implementation
}
```

### API Documentation

Update `API_DOCUMENTATION.md` when:
- Adding new endpoints
- Changing request/response formats
- Modifying authentication requirements
- Adding new error codes

### README Updates

Update `README.md` when:
- Adding new features
- Changing configuration
- Updating dependencies
- Modifying installation steps

---

## 🎨 Best Practices

### Security

- Never commit sensitive data (passwords, keys, etc.)
- Use environment variables for configuration
- Validate all user inputs
- Use parameterized queries (Prisma handles this)
- Follow OWASP security guidelines

### Performance

- Use database indexes appropriately
- Implement pagination for large datasets
- Optimize N+1 queries
- Use caching when appropriate
- Monitor memory usage

### Error Handling

- Use APIError for known errors
- Log errors with appropriate level
- Never expose sensitive information in errors
- Provide helpful error messages

---

## 🆘 Getting Help

### Resources

- [README.md](README.md) - Project overview and setup
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [SECURITY.md](SECURITY.md) - Security guidelines

### Communication Channels

- **Issues:** For bugs and feature requests
- **Discussions:** For questions and ideas
- **Email:** dev@alrabei.com

---

## 🙏 Recognition

Contributors will be recognized in:
- CHANGELOG.md
- Contributors section in README.md
- Release notes

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

**Thank you for contributing to AL RABEI Real Estate Backend! 🎉**


