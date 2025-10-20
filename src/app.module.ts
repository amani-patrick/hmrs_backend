import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

import { TenantsModule } from './public-modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { PositionModule } from './modules/position/position.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { LeaveModule } from './modules/leave/leave.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { DashboardModule } from './modules/admin/dashboard/dashboard.module';

import { TenancyModule } from './tenancy/tenancy.module';
import { TenancyMiddleware } from './tenancy/tenancy.middleware';
import { TimeModule } from './modules/time/time.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SharedModule } from './shared/shared.module';

// Global filters and interceptors
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PerformanceModule } from './modules/performance/performance.module';
import { TrainingModule } from './modules/training/training.module';
import { AuditModule } from './modules/audit/audit.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
      }),
    }),
    TenantsModule,
    TenancyModule,
    UsersModule,
    AuthModule,
    DepartmentModule,
    PositionModule,
    RecruitmentModule,
    PayrollModule,
    LeaveModule,
    SettingsModule,
    CalendarModule,
    MessagingModule,
    TimeModule,
    DocumentsModule,
    SharedModule,
    DashboardModule,
    PerformanceModule,
    TrainingModule,
    AuditModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule  implements  NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(TenancyMiddleware).forRoutes('*')
  }
}