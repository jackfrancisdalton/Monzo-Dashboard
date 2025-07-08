import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost', 
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'dashboard',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'monzo_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],

    // Clear and sync during development to avoid having to deal with migrations 
    synchronize: true,
    dropSchema: true,
  });