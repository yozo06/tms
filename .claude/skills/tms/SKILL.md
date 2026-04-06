```markdown
# tms Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `tms` TypeScript codebase. It covers file organization, code style, commit practices, and testing patterns, providing clear examples and step-by-step workflows to help you contribute efficiently and consistently.

## Coding Conventions

### File Naming
- Use **snake_case** for all file names.
  - Example:  
    ```
    user_service.ts
    order_processor.test.ts
    ```

### Import Style
- Use **relative imports** for referencing other modules.
  - Example:
    ```typescript
    import UserService from './user_service';
    import { processOrder } from '../utils/order_utils';
    ```

### Export Style
- Use **default exports** for modules.
  - Example:
    ```typescript
    export default class UserService { ... }
    ```

### Commit Messages
- Follow **conventional commit** format.
- Use the `feat` prefix for new features.
- Example:
  ```
  feat: add user authentication middleware
  ```

## Workflows

### Add a New Feature
**Trigger:** When implementing a new feature or module  
**Command:** `/add-feature`

1. Create a new file using snake_case (e.g., `feature_name.ts`).
2. Write your TypeScript code, using default exports.
3. Use relative imports to include dependencies.
4. Write corresponding tests in a `.test.ts` file.
5. Commit your changes with a `feat:` prefix and a clear, concise message.
   - Example:  
     ```
     feat: implement password reset functionality
     ```

### Write and Run Tests
**Trigger:** When adding or updating code that requires validation  
**Command:** `/run-tests`

1. Create or update a test file matching `*.test.*` (e.g., `user_service.test.ts`).
2. Write your test cases using the project's preferred (unknown) testing framework.
3. Run the tests using the project's test runner (framework not specified).
4. Ensure all tests pass before committing.

### Refactor Existing Code
**Trigger:** When improving code structure or readability  
**Command:** `/refactor-code`

1. Identify the file(s) to refactor.
2. Apply changes, maintaining snake_case naming and relative imports.
3. Update or add tests as needed.
4. Commit with a clear message, e.g.:
   ```
   feat: refactor order processing logic for clarity
   ```

## Testing Patterns

- Test files use the pattern `*.test.*` (e.g., `order_processor.test.ts`).
- The specific testing framework is not detected; follow existing test file patterns.
- Place test files alongside the modules they test or in a dedicated test directory, as per project structure.
- Example test file:
  ```typescript
  import UserService from './user_service';

  describe('UserService', () => {
    it('should create a new user', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /add-feature   | Scaffold and implement a new feature/module  |
| /run-tests     | Run all test files matching `*.test.*`       |
| /refactor-code | Refactor existing code following conventions |
```
