import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
// Note: TenantsService and TenantsController are in public-modules/tenants
// This module is for tenant entity only

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [],
  controllers: [],
  exports: []
})
export class TenantsModule {}
