# v1.0.0 - 2025-08-28

## Initial release

### DocsParser

#### Task
As a developer, I want to extract documentation from tests to automatically generate README files.

##### Acceptance Criteria
- Tests with `@docs` comments should be parsed into markdown documentation
- Code examples in tests should be included in the generated documentation
- Documentation should maintain proper structure and formatting

#### Task
As a technical writer, I want to ensure all API functions are properly documented with clear examples.

##### Acceptance Criteria
- Each exported function must have installation examples
- Usage examples should include both basic and advanced scenarios
- All code blocks should be executable and tested

### DatasetParser

For LLM fine-tuning we need to generate datasets for every git tag version.

#### Task
As an AI trainer, I want to convert test documentation into structured datasets for model fine-tuning.

##### Acceptance Criteria
- All test cases starting with "How to..." in markdown format must be extracted into a JSON Lines format.
- Each entry must have `instruction`, `output`, `context`, `input`, `tags`, and `proven` fields.
- The generated file must be saved as `.datasets/README.dataset.jsonl`.

#### Task
As a developer, I want to test dataset generation to ensure quality training data.

##### Acceptance Criteria
- Verify correct extraction of all documentation sections
- Validate presence of required fields in each entry
- Ensure dataset coverage of all public APIs

### MemoryDB

#### Task
As a tester, I want to use in-memory database for isolated unit testing.

##### Acceptance Criteria
- Mock database implementation should not require external dependencies
- Predefined test data should be loaded during connection
- Directory listing and path resolution should work correctly

#### Task
As a developer, I want to simulate filesystem operations without actual disk I/O.

##### Acceptance Criteria
- Support for reading, writing and listing virtual filesystem entries
- Path resolution with support for relative and absolute paths
- Access logging for test verification

### mockFetch

#### Task
As an API consumer, I want to mock HTTP requests for reliable unit tests.

##### Acceptance Criteria
- Support exact route matching, wildcards and catch-all patterns
- Handle various HTTP methods and status codes
- Return proper Response objects with json/text methods

#### Task
As a developer, I want to easily test different API response scenarios.

##### Acceptance Criteria
- Function-based responses for dynamic mock data
- Support for custom HTTP status codes
- Automatic 404 handling for unmatched routes

### runSpawn

#### Task
As a DevOps engineer, I want to execute shell commands in tests and capture output.

##### Acceptance Criteria
- Execute external processes and return exit codes
- Capture stdout content for verification
- Handle custom data processing callbacks

#### Task
As a developer, I want to integrate CLI tool testing into my unit tests.

##### Acceptance Criteria
- Promise-based interface for child processes
- Support for command arguments and spawn options
- Graceful handling of process errors

### TestNode

#### Task
As a test reporter, I want to parse TAP output into structured node trees.

##### Acceptance Criteria
- Extract metadata like test counts, duration, version
- Support nested test suites and subtests
- Provide easy access to TAP statistics through getters

#### Task
As a test analyzer, I want to traverse test results programmatically.

##### Acceptance Criteria
- Represent test output as hierarchical node structure
- Find specific content by prefix matching
- Maintain relationship between parent and child tests

### NodeTestParser

#### Task
As a test tool developer, I want to encode/decode TAP format test results.

##### Acceptance Criteria
- Parse TAP text into TestNode tree structures
- Generate TAP text from node hierarchies
- Handle indentation and subtest nesting correctly

#### Task
As a CI/CD integrator, I want to process Node.js test output programmatically.

##### Acceptance Criteria
- Support standard TAP version 13 format
- Extract detailed test execution metrics
- Reconstruct original test output from parsed data

### Generate docs.api.json [](./DocsAPI.test.js)

For automative API-helpers we need to implement `docs.api.json` that can be generated automatically similar to README.md from the tests.

#### Task
As a user, I want to have documentation in a structured format so that I can better understand the API and easily navigate the content.

##### Acceptance Criteria
- The `docs/api.json` file must include all public APIs with their descriptions, examples and parameters.
- The file must be generated during `pnpm test` by extracting the documented test examples.
