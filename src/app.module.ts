import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantsModule } from './public-modules/tenants/tenants.module';
import { TenancyModule } from './tenancy/tenancy.module';
import configuration from './config/configuration';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenancyMiddleware } from './tenancy/tenancy.middleware';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { PositionModule } from './modules/position/position.module';
import { DashboardController } from './admin/dashboard/dashboard.controller';
import { AdminService } from './modules/admin/admin.service';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { PayrollModule } from './modules/payroll/payroll.module';



@Module({
  imports: [
    ConfigModule.forRoot({
          isGlobal: true, 
          load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get('database');
        
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,

          entities: [__dirname + '/public-modules/**/*.entity{.ts,.js}'], 
          
          schema: dbConfig.public_schema,
          synchronize: process.env.NODE_ENV === 'development', 
          autoLoadEntities: true,
        };
      },
    }),

    TenantsModule,

    TenancyModule,

    UsersModule,

    AuthModule,

    DepartmentModule,

    PositionModule,

    RecruitmentModule,

    PayrollModule,
  ],
  controllers: [DashboardController],
  providers: [AdminService],
})
export class AppModule  implements  NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(TenancyMiddleware).forRoutes('*')
  }
}