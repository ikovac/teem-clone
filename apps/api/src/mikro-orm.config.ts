import 'dotenv/config.js';
import databaseConfig from './config/database.config';

export default {
  ...databaseConfig(),
  entities: ['**/*.entity.ts'],
};
