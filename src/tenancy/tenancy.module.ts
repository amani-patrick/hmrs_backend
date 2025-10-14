import { Module, Scope, Global, Inject } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TENANT_DATA_SOURCE } from './tenancy.symbols';
import { ITenantContext, TENANT_CONTEXT } from './tenancy.interface';


const tenantDataSources = new Map<string, DataSource>();

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TENANT_DATA_SOURCE,
      scope: Scope.REQUEST, 
      
      useFactory: async (request: Request, config: ConfigService) => {
        const tenantContext: ITenantContext | undefined = request[TENANT_CONTEXT];
        if (!tenantContext) {
            // For production safety, you might throw an error here for protected routes.
            // For now, we'll return null or throw an explicit error in guards later.
            return null;
        }

        const schemaName = tenantContext.schemaName;

        const cached = tenantDataSources.get(schemaName);
        if (cached?.isInitialized) {
          return cached;
        }

        const dbConfig = config.get<{ host: string; port: number; username: string; password: string; name: string }>('database')!;
        const connectionOptions: DataSourceOptions = {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          
          schema: schemaName, 
          
          entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
          
          synchronize: process.env.NODE_ENV === 'development',
          logging: false,
        };

        const dataSource = new DataSource(connectionOptions);
        await dataSource.initialize();
        tenantDataSources.set(schemaName, dataSource);

        return dataSource;
      },
      // Note: We need to inject the request object and ConfigService
      inject: [REQUEST, ConfigService],
    },
  ],
  exports: [TENANT_DATA_SOURCE],
})
export class TenancyModule {}