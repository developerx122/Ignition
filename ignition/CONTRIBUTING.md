# Contributing to Ignition ⚡

Thank you for your interest in contributing to Ignition! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ignition.git
   cd ignition
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ignition.git
   ```

## Development Setup

### Prerequisites

- Node.js 18.18 or higher
- pnpm 8.0 or higher
- PostgreSQL 14 or higher
- Docker (optional, for containerized development)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# (at minimum, set DATABASE_URL)

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate:dev

# Start development server
pnpm dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- metadata.test.ts
```

## Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes**:
   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   ```

4. **Commit your changes** following our [commit convention](#commit-convention)

## Pull Request Process

1. **Update documentation** if your changes affect user-facing behavior
2. **Add tests** for new functionality
3. **Ensure all tests pass** and there are no linting errors
4. **Update the README.md** if needed
5. **Submit your pull request** with a clear description of the changes

### PR Title Format

Use the same format as commits:
```
type(scope): description
```

Example: `feat(scanner): add rate limiting for X API calls`

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit return types for functions
- Use interfaces over types where appropriate
- Document public APIs with JSDoc comments

### Code Style

- Use Prettier for formatting (runs automatically on commit)
- Follow ESLint rules (no warnings or errors)
- Use meaningful variable and function names
- Keep functions small and focused

### File Organization

```
src/
├── config/      # Configuration and environment
├── db/          # Database client and utilities
├── engine/      # Core engine logic
├── lib/         # Shared utilities
├── routes/      # API endpoints
└── types/       # TypeScript type definitions
```

### Testing

- Write tests for new functionality
- Aim for >80% code coverage
- Use descriptive test names
- Test edge cases and error conditions

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |

### Scopes

Common scopes include:
- `scanner` - Follower scanner
- `launcher` - Token launcher
- `api` - REST API
- `db` - Database
- `config` - Configuration
- `deps` - Dependencies

### Examples

```bash
feat(scanner): add support for X API v2
fix(launcher): handle transaction timeout errors
docs: update deployment instructions
refactor(config): simplify environment validation
test(metadata): add edge case tests for long usernames
```

## Questions?

If you have questions or need help:
1. Check existing issues and discussions
2. Open a new issue with the "question" label
3. Join our community chat (if available)

Thank you for contributing! ⚡
