import { DataSource } from 'typeorm';
import { BenefitPlan } from './entities/benefit-plan.entity';
import { BenefitEnrollment } from './entities/benefit-enrollment.entity';
import { BenefitClaim } from './entities/benefit-claim.entity';

export const benefitsProviders = [
  {
    provide: 'BENEFIT_PLAN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(BenefitPlan),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'BENEFIT_ENROLLMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(BenefitEnrollment),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'BENEFIT_CLAIM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(BenefitClaim),
    inject: ['DATA_SOURCE'],
  },
];
