import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

import { TenancyModule } from './tenancy/tenancy.module';
import { TenancyMiddleware } from './tenancy/tenancy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      load: [configuration],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule  implements  NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(TenancyMiddleware).forRoutes('*')
  }
}