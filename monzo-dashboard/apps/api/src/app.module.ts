import { Module } from '@nestjs/common';
import { DashboardDataModule } from './dashboard-data/dashboard-data.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './env-vars.config';
import { MonzoModule } from './monzo/monzo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      ignoreEnvFile: true, // <-- we provide the env file in the package.json dev script
    }),
    AuthModule.register(),
    MonzoModule.register(),
    DashboardDataModule,
    ...(process.env.USE_REAL_MONZO_API === 'true'
      ? [TypeOrmModule.forRoot(databaseConfig())]
      : []),
  ],
})
export class AppModule {}
