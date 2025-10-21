import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { onboardingProviders } from './onboarding.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OnboardingController],
  providers: [...onboardingProviders, OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
