import * as path from 'path';

import { config } from 'dotenv';

// Load from .env (same as development) - change to .env.test for separate test DB
config({ path: path.resolve(__dirname, '../.env') });
jest.setTimeout(30000); // 30s timeout for E2E
