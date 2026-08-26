# Contributing Guidelines

Thank you for your interest in contributing to this project! To ensure a smooth collaboration and maintain code quality, please follow the workflow outlined below.

## Development Workflow

Our development process follows a structured branch-and-merge flow:

### 1. Ticket
Before starting any work, ensure there is an issue (ticket) created and assigned to you for the task. This helps track progress and discussions related to the feature or bug fix.

### 2. Branch
Always branch off from the latest `develop` branch. Create a new feature branch with a descriptive name, such as `feature/login` or `bugfix/header-styling`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 3. Commit
Write your code, commit your changes with clear and concise commit messages, and push to your remote feature branch.

```bash
git add .
git commit -m "Brief description of your changes"
git push origin feature/your-feature-name
```

### 4. PR to Develop
Once your feature is complete, open a Pull Request (PR) from your feature branch into the `develop` branch.

### 5. Review
Request a review from at least one other developer. Address any feedback and ensure the reviewer approves the PR before proceeding.

### 6. Merge
After the PR is approved, it can be merged into the `develop` branch.

### 7. Release
Releases to production are handled manually. Once `develop` has accumulated enough tested and stable features, a manual PR will be opened to merge `develop` into `main` for the final production release.

---
By following these steps, you help us keep the project organized, stable, and easy to maintain. Happy coding!
