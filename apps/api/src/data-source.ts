import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { User } from './user/user.entity.js';
import { UserProfile } from './user/user-profile.entity.js';

// Localiza o arquivo .env na raiz do projeto
const currentDir = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(currentDir, '../../../.env'),
});

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, UserProfile],
  migrations: [resolve(currentDir, 'migrations/*{.ts,.js}')],
  synchronize: false,
});

export default dataSource;
