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

    // TECHDEBT: As development is on-going and no active users i am setting synchronize to true.
    // This will auto create the database schema based on the entities.
    // When in full release this should be set to false and migrations used instead.
    synchronize: true,
});
}