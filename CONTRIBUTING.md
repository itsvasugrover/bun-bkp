# Contributing Guidelines

Thank you for your interest in contributing to this project. This document outlines the process and guidelines for making contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Reporting Issues](#reporting-issues)
- [Submitting Changes](#submitting-changes)
  - [Commit Message Rules](#commit-message-rules)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Review Process](#review-process)
- [License](#license)

## Code of Conduct

All contributors are expected to adhere to professional standards of conduct. We are committed to providing a welcoming and inclusive environment for everyone. Harassment, discrimination, or unprofessional behavior will not be tolerated.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Reviewed the project documentation
- Set up your development environment according to the project requirements
- Familiarized yourself with the project structure and architecture
- Read through existing issues and pull requests to avoid duplication

### Development Setup

1. Fork the repository
2. Clone your fork to your local machine
3. Configure the upstream remote
4. Install dependencies as specified in the project documentation
5. Verify your setup by running tests and build processes

## How to Contribute

Contributions can take many forms:

- Bug fixes
- Feature implementations
- Documentation improvements
- Test coverage enhancements
- Performance optimizations
- Security vulnerability patches
- Code refactoring

## Reporting Issues

When reporting issues, please provide:

- A clear and descriptive title
- Detailed description of the problem
- Steps to reproduce the issue
- Expected behavior versus actual behavior
- Environment details (operating system, version numbers, configuration)
- Relevant logs, error messages, or screenshots
- Any attempted solutions or workarounds

### Issue Guidelines

- Search existing issues before creating a new one
- Use the provided issue templates if available
- Provide as much relevant information as possible
- Be respectful and professional in all communications
- Follow up on your issues and respond to requests for additional information

## Submitting Changes

### Branch Strategy

- Create a new branch for each contribution
- Use descriptive branch names that reflect the purpose of the changes
- Keep branches focused on a single issue or feature
- Regularly sync your branch with the upstream repository

### Commit Guidelines

- Write clear, concise commit messages
- Follow the conventional commit format outlined below
- Keep commits atomic and focused on a single logical change
- Include relevant issue numbers in commit messages
- Ensure each commit represents a working state

### Commit Message Rules

We follow the Conventional Commits specification for all commit messages. This standardization enables automated tooling, clear changelogs, and better project history.

#### Commit Message Format

Each commit message consists of a header, an optional body, and an optional footer:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

#### Header

The header is mandatory and must conform to the following format:

**Type**
Must be one of the following:

- `feat`: A new feature for the user or a significant change to existing functionality
- `fix`: A bug fix that addresses an issue in the codebase
- `docs`: Documentation only changes (README, comments, guides)
- `style`: Changes that do not affect the meaning of the code (formatting, white-space, semi-colons)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that do not modify source or test files
- `revert`: Reverts a previous commit

**Scope** (Optional)

The scope provides additional contextual information and should be a noun describing the section of the codebase:

- Use lowercase
- Be concise and specific
- Examples: `config`, `api`, `parser`, `auth`, `docs`

**Description**
The description is a brief summary of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Do not capitalize the first letter
- No period at the end
- Limit to 72 characters or less
- Be clear and descriptive

#### Body (Optional)

The body should provide additional context about the change:

- Use the imperative, present tense
- Include the motivation for the change
- Contrast the new behavior with previous behavior
- Wrap lines at 72 characters
- Separate from the header with a blank line

#### Footer (Optional)

The footer should contain:

- Breaking changes prefixed with `BREAKING CHANGE:`
- Issue references using keywords like `Fixes`, `Closes`, or `Resolves`
- Additional metadata or references
- Separate from the body with a blank line

#### Examples

**Simple commit with type and description:**

```bash
feat: add user authentication module
```

**Commit with scope:**

```bash
fix(api): resolve null pointer exception in user endpoint
```

**Commit with body:**

```bash
feat(auth): implement JWT token authentication

Add support for JSON Web Tokens to handle user authentication
and authorization. This replaces the previous session-based
approach and provides better scalability for distributed systems.
```

**Commit with footer:**

```bash
fix(parser): handle edge case in date parsing

The parser now correctly handles leap year dates and timezone
offsets that were previously causing validation errors.

Fixes #123
```

**Breaking change:**

```bash
feat(api): update authentication API endpoint structure

Restructure the authentication endpoints to follow RESTful
conventions and improve consistency across the API.

BREAKING CHANGE: The `/auth/login` endpoint has been moved to
`/api/v2/auth/login`. Clients must update their API calls to
use the new endpoint structure.

Closes #456
```

**Revert commit:**

```bash
revert: feat(api): add experimental caching layer

This reverts commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0.

Reason: The caching layer introduced race conditions in
production environments.
```

#### Best Practices

**Do:**

- Keep the subject line concise and informative
- Use the body to explain what and why, not how
- Reference issues and pull requests when relevant
- Make atomic commits that represent a single logical change
- Ensure the codebase is in a working state after each commit
- Group related changes in a single commit when appropriate

**Do Not:**

- Combine multiple unrelated changes in a single commit
- Use vague descriptions like "fix bug" or "update code"
- Include WIP (Work in Progress) or temporary commits in pull requests
- Commit commented-out code or debugging statements
- Ignore commit message guidelines for convenience

#### Commit Message Validation

Commit messages may be automatically validated using commit hooks or CI checks. Ensure your messages conform to these rules before pushing:

- Header must match the specified format
- Type must be from the approved list
- Description must be present and properly formatted
- Line length limits must be respected
- Breaking changes must be properly documented

#### Amending Commits

If you need to modify a commit message:

**Last commit:**

```bash
git commit --amend
```

**Older commits (use with caution):**

```bash
git rebase -i HEAD~n
```

Note: Avoid amending commits that have already been pushed to shared branches unless coordinating with your team.

### Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation as needed
   - Follow the project's coding standards
   - Rebase your branch on the latest upstream changes
   - Review your own changes for quality and completeness

2. **Pull Request Content**
   - Provide a clear title and description
   - Reference related issues
   - Explain the rationale for your changes
   - Highlight any breaking changes or migration requirements
   - Include screenshots or examples if applicable

3. **After Submission**
   - Monitor your pull request for feedback
   - Respond promptly to review comments
   - Make requested changes in a timely manner
   - Keep the pull request up to date with the target branch
   - Be open to suggestions and constructive criticism

## Coding Standards

### General Principles

- Write clean, readable, and maintainable code
- Follow established patterns and conventions in the codebase
- Keep functions and modules focused and single-purpose
- Use meaningful names for variables, functions, and classes
- Comment complex logic and non-obvious implementation decisions
- Avoid unnecessary complexity and premature optimization

### Code Quality

- Adhere to the project's style guide and linting rules
- Maintain consistent formatting throughout your contributions
- Remove dead code, debugging statements, and commented-out code
- Handle errors appropriately and provide useful error messages
- Consider edge cases and potential failure modes

## Testing Requirements

### Test Coverage

- Write tests for new features and bug fixes
- Ensure existing tests continue to pass
- Maintain or improve overall test coverage
- Include unit tests, integration tests, and end-to-end tests as appropriate

### Test Quality

- Write clear and descriptive test names
- Test both success and failure scenarios
- Ensure tests are reliable and reproducible
- Avoid dependencies between tests
- Keep tests maintainable and easy to understand

## Documentation

### Code Documentation

- Document public APIs, interfaces, and complex algorithms
- Keep documentation up to date with code changes
- Use clear and concise language
- Provide examples for complex functionality

### Project Documentation

- Update relevant documentation files when making changes
- Add new documentation for new features
- Ensure documentation is accurate and helpful
- Consider the audience and their level of expertise

## Review Process

### Expectations

- All contributions require review before merging
- Reviews may take time depending on complexity and reviewer availability
- Multiple rounds of review may be necessary
- Not all contributions will be accepted

### Review Criteria

- Correctness and completeness of the implementation
- Code quality and adherence to standards
- Test coverage and quality
- Documentation quality and completeness
- Impact on existing functionality
- Alignment with project goals and architecture

### Responding to Feedback

- Be professional and respectful in all interactions
- Ask for clarification if feedback is unclear
- Provide rationale for your implementation decisions
- Be willing to make changes based on feedback
- Learn from the review process

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project. Ensure you have the right to submit your contributions and that they do not violate any third-party rights or licenses.

### Contributor Agreement

- You certify that you wrote the contribution or have the right to submit it
- You understand and agree that your contribution may be redistributed
- Your contribution is provided without warranties of any kind
- You grant the project maintainers a perpetual, worldwide, non-exclusive license to use your contribution

## Questions and Support

If you have questions about contributing:

- Review the project documentation thoroughly
- Search existing issues and discussions
- Reach out to maintainers through appropriate channels
- Be patient and respectful when seeking assistance

## Recognition

We value and appreciate all contributions to this project. Contributors who follow these guidelines and make meaningful contributions help improve the project for everyone.

---

**Last Updated**: February 16, 2026

Thank you for contributing to this project.
