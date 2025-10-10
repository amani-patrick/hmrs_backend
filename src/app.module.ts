import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantsModule } from './public-modules/tenants/tenants.module';
import { TenancyModule } from './tenancy/tenancy.module';
import configuration from './config/configuration';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}