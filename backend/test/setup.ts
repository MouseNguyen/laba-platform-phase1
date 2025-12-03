import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '../.env.test') });
jest.setTimeout(30000); // 30s timeout for E2E
