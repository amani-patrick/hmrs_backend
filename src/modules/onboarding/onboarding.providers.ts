import { DataSource } from 'typeorm';
import { OnboardingProcess } from './entities/onboarding-process.entity';
import { OffboardingProcess } from './entities/offboarding-process.entity';

export const onboardingProviders = [
  {
    provide: 'ONBOARDING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OnboardingProcess),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'OFFBOARDING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OffboardingProcess),
    inject: ['DATA_SOURCE'],
  },
];
