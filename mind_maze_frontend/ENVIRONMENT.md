# Environment Configuration

The app reads optional React environment variables (prefixed with REACT_APP_). None are required to run locally.

- REACT_APP_FEATURE_FLAGS: comma separated flags, example: "confetti=true"
- REACT_APP_EXPERIMENTS_ENABLED: "true" enables some enhancements by default (confetti)

Note: Never put secrets in these variables; this app does not require any secrets.
