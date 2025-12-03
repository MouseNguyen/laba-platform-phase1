# Load Testing with k6

## Prerequisites

- Install k6: https://k6.io/docs/get-started/installation/

## Running Tests

### Auth Flow
Simulates users logging in and fetching profile.

```bash
k6 run --out json=results.json test/load/auth-flow.js
```

### Refresh Token Reuse
Simulates token reuse attacks.

```bash
k6 run test/load/refresh-reuse.js
```

## Metrics

Results are saved to `results.json`. You can also view real-time metrics in the console.
