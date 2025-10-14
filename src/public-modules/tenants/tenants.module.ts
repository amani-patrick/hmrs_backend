import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantsService],
  exports: [TenantsService]
})
export class TenantsModule {}
