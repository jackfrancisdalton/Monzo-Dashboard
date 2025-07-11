import { Module } from '@nestjs/common';
import { MonzoModule } from './monzo/monzo.module';
import { DashboardDataModule } from './dashboard-data/dashboard-data.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './env-vars.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: '../../.env'
    }),
    AuthModule,
    MonzoModule, 
    DashboardDataModule,
    TypeOrmModule.forRoot(databaseConfig()),
  ],
})
export class AppModule {}