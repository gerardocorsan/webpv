# Testing Guide - webpv Backend

Comprehensive guide for running tests on the webpv backend.

## Prerequisites

### ⚠️ IMPORTANT: Firestore Emulator Setup

**Step 1:** Start the Firestore emulator:

```bash
gcloud emulators firestore start
```

**Step 2:** Copy the `export` command from the output (the port changes each time):

```
[firestore] API endpoint: http://[::1]:8421
[firestore]
[firestore]    export FIRESTORE_EMULATOR_HOST=[::1]:8421    👈 Copy this!
```

**Step 3:** Set the environment variable and run tests:

```bash
# In the same terminal or a new one:
export FIRESTORE_EMULATOR_HOST=[::1]:8421  # Use the actual port from step 2

# Now run tests
pytest
```

The tests will automatically:
- ✅ Read `FIRESTORE_EMULATOR_HOST` from environment
- ✅ Verify the emulator is reachable
- ✅ Exit with helpful error if not configured

### Other Prerequisites

2. **Dependencies installed** (including bcrypt 4.2.1):
   ```bash
   pip install -r requirements.txt
   ```

3. **Python 3.11+** (tests use features compatible with 3.13)

## Running Tests

### All Tests

```bash
pytest
```

Expected output:
```
tests/test_auth.py ..................  [66%]
tests/test_route_planning.py ........  [88%]
tests/test_security.py ..........      [100%]

====== 38 passed in 5.43s ======
```

### Specific Test Files

```bash
# Authentication tests
pytest tests/test_auth.py

# Route planning tests
pytest tests/test_route_planning.py

# Security (JWT, password hashing) tests
pytest tests/test_security.py
```

### Specific Test Classes or Functions

```bash
# Run only login tests
pytest tests/test_auth.py::TestLogin

# Run specific test
pytest tests/test_auth.py::TestLogin::test_login_success
```

### Verbose Output

```bash
pytest -v
```

### Show Print Statements

```bash
pytest -s
```

### Stop on First Failure

```bash
pytest -x
```

### Run Last Failed Tests

```bash
pytest --lf
```

## Test Coverage

### Generate Coverage Report

```bash
# Install coverage
pip install pytest-cov

# Run tests with coverage
pytest --cov=app --cov-report=html

# Open coverage report
open htmlcov/index.html
```

### Coverage Summary

```bash
pytest --cov=app --cov-report=term
```

Expected coverage (M1):
- `app/core/security.py`: ~95%
- `app/services/auth_service.py`: ~85%
- `app/services/route_service.py`: ~80%
- `app/api/*`: ~90%

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures
├── test_auth.py             # Authentication endpoint tests
├── test_route_planning.py   # Route planning endpoint tests
└── test_security.py         # Security utilities tests
```

## Test Categories

### Unit Tests (test_security.py)

Tests isolated functions without external dependencies:
- Password hashing
- JWT token generation/validation
- Refresh token generation

```bash
pytest tests/test_security.py
```

### Integration Tests (test_auth.py, test_route_planning.py)

Tests API endpoints with database connections:
- Login flows
- Token refresh
- Route planning
- Error handling

```bash
pytest tests/test_auth.py tests/test_route_planning.py
```

## Test Fixtures

### Available Fixtures (from conftest.py)

- `client`: FastAPI TestClient
- `test_user_data`: Test user dictionary
- `blocked_user_data`: Blocked user dictionary
- `create_test_user`: Creates test user in Firestore (auto-cleanup)
- `create_blocked_user`: Creates blocked user in Firestore (auto-cleanup)
- `auth_token`: Valid JWT token for test user
- `auth_headers`: Authorization headers with valid token

### Using Fixtures

```python
def test_example(client, create_test_user, auth_headers):
    # Test user is created automatically
    # Use auth_headers for authenticated requests
    response = client.get("/api/plan-de-ruta", headers=auth_headers)
    assert response.status_code == 200
    # Test user is deleted automatically after test
```

## Troubleshooting

### Firestore Connection Errors

**Error**: `Failed to initialize Firestore client`

**Solution**:
```bash
# Start emulator
gcloud emulators firestore start

# Set environment variable
export FIRESTORE_EMULATOR_HOST=localhost:8910

# Run tests
pytest
```

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**: Run from backend directory:
```bash
cd backend
pytest
```

### Test Isolation Issues

If tests are affecting each other:

```bash
# Run tests in isolation (slower but safer)
pytest --forked
```

### Mock SQL Server

Tests use mocked SQL Server responses to avoid database dependency. If you need to test real SQL Server integration, comment out the `@patch` decorators in `test_route_planning.py`.

## Writing New Tests

### Test Template

```python
import pytest
from fastapi import status

class TestNewFeature:
    """Test new feature"""

    def test_feature_success(self, client, create_test_user, auth_headers):
        """Test successful case"""
        response = client.post(
            "/api/new-endpoint",
            headers=auth_headers,
            json={"data": "value"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "expected_field" in data

    def test_feature_error(self, client):
        """Test error case"""
        response = client.post("/api/new-endpoint", json={})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
```

### Best Practices

1. **One assertion per test** (when possible)
2. **Clear test names** describing what is tested
3. **Use fixtures** for setup/teardown
4. **Mock external dependencies** (SQL Server, etc.)
5. **Test both success and failure cases**
6. **Clean up resources** (fixtures handle this automatically)

## Continuous Integration

Add to CI/CD pipeline:

```yaml
# .github/workflows/test.yml (example)
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Start Firestore Emulator
        run: |
          gcloud emulators firestore start &
          sleep 5

      - name: Run tests
        env:
          FIRESTORE_EMULATOR_HOST: localhost:8910
        run: |
          pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Data

### Test Users (created by fixtures)

- **TEST001**: Standard test user (asesor, ruta 001)
- **BLOCKED001**: Blocked test user

### Seeded Users (from seed_firestore.py)

- **A012345**: Demo asesor (ruta 001)
- **A067890**: Demo supervisor (ruta 002)

## Performance

### Test Execution Time

Expected times (on modern hardware):
- Unit tests: ~1-2 seconds
- Integration tests: ~3-5 seconds
- All tests: ~5-7 seconds

### Slow Tests

If tests are slow:

```bash
# Show slowest tests
pytest --durations=10
```

## Summary

| Test File | Tests | Purpose |
|-----------|-------|---------|
| `test_security.py` | 12 | Password hashing, JWT, refresh tokens |
| `test_auth.py` | 11 | Login, logout, token refresh, rate limiting |
| `test_route_planning.py` | 15 | Route plan endpoint, data transformation |
| **Total** | **38** | **M1 Test Coverage** |

All tests should pass before deploying to production! ✅
