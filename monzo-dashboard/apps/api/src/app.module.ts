import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MonzoModule } from './monzo/monzo.module';
import { DashboardDataModule } from './dashboard-data/dashboard-data.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MonzoModule, 
    DashboardDataModule,
    TypeOrmModule.forRoot(databaseConfig()),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
