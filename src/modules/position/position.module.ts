import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { TENANT_DATA_SOURCE } from '../../tenancy/tenancy.symbols';

@Module({
  controllers: [PositionController],
  providers: [
    {
      provide:'POSITION_REPOSITORY',
      useFactory: (tenant.DataSource: DataSource)=>{
        if(!tenantDataSource) return null;
        return tenantDataSource.getRepository(Position);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    PositionService,
  ],
  exports:[ PositionService]
})
export class PositionModule {}
