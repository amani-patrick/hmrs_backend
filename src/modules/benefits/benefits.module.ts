import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { benefitsProviders } from './benefits.providers';

@Module({
  imports: [DatabaseModule],
  providers: [BenefitsService, ...benefitsProviders],
  controllers: [BenefitsController],
  exports: [BenefitsService],
})
export class BenefitsModule {}
