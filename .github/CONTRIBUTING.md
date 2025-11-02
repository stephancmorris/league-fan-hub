# Contributing to NRL Fan Hub

## Branch Strategy

We follow a feature branch workflow:

### Main Branches
- `main` - Production-ready code, protected branch
- `develop` - Integration branch for features, protected branch

### Feature Branches
- `feature/*` - New features (e.g., `feature/AUTH-001-auth0-setup`)
- `fix/*` - Bug fixes (e.g., `fix/MATCH-003-websocket-reconnect`)
- `refactor/*` - Code refactoring
- `test/*` - Test additions or updates
- `docs/*` - Documentation updates

### Branch Naming Convention
Format: `type/TASK-ID-short-description`

Examples:
- `feature/AUTH-001-auth0-integration`
- `fix/PRED-003-prediction-lock`
- `refactor/LEAD-002-leaderboard-query`

## Workflow

1. **Create a branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/TASK-ID-description
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow the style guide (enforced by ESLint/Prettier)
   - Add tests for new functionality

3. **Commit your changes**
   - Use conventional commits
   - Reference task IDs
   ```bash
   git commit -m "feat(auth): implement Auth0 login [AUTH-001]"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/TASK-ID-description
   ```
   - Open PR against `develop`
   - Fill out the PR template completely
   - Request review

5. **Review process**
   - CI must pass (lint, tests, build)
   - At least 1 approval required
   - Address review feedback

6. **Merge**
   - Squash and merge to `develop`
   - Delete feature branch after merge

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject [TASK-ID]

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add Auth0 login component [AUTH-003]
fix(match): resolve WebSocket reconnection issue [MATCH-007]
docs: update API documentation [DOCS-003]
test(prediction): add validation tests [PRED-004]
```

## Code Style

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Pre-commit hooks enforce style
- Use functional components with hooks
- Prefer named exports
- Write self-documenting code

## Testing Requirements

- Unit tests for utilities and hooks
- Component tests for React components
- Integration tests for API routes
- E2E tests for critical user flows
- Minimum 70% coverage for new code

## Pull Request Guidelines

1. Keep PRs focused and small
2. Link to the related story/task
3. Provide clear description
4. Include screenshots for UI changes
5. Update documentation
6. Ensure CI passes
7. Address all review comments

## Development Setup

```bash
# Install dependencies
npm install

# Setup Husky hooks
npm run prepare

# Run development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

## Questions?

- Check the [README](../README.md)
- Review the [design document](../nrl-fan-hub-design-doc.pdf)
- Ask in PR comments
