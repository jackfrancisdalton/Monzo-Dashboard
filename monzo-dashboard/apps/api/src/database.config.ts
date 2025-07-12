import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const databaseConfig = (): TypeOrmModuleOptions => {
  return ({
    type: 'postgres',
    host: process.env.DB_HOST, 
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/**/*.entity.{js,ts}'],

    // Sync during development to avoid having to deal with migrations 
    // TODO: This should be replaced with proper migrations in production
    synchronize: true,
});
}