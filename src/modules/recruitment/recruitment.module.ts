import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { JobPosting } from './entities/job-posting.entity';
import { Candidate } from './entities/candidate.entity';
import { Interview } from './entities/interview.entity';
import { TENANT_DATA_SOURCE } from '../../tenancy/tenancy.symbols';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting, Candidate, Interview]),
    forwardRef(() => UsersModule),
  ],
  controllers: [RecruitmentController],
  providers: [
    {
      provide: 'JOB_POSTING_REPOSITORY',
      useFactory: (tenantDataSource: DataSource) => {
        if (!tenantDataSource) {
          throw new Error('Accessing job postings without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(JobPosting);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    {
      provide: 'CANDIDATE_REPOSITORY',
      useFactory: (tenantDataSource: DataSource) => {
        if (!tenantDataSource) {
          throw new Error('Accessing candidates without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(Candidate);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    {
      provide: 'INTERVIEW_REPOSITORY',
      useFactory: (tenantDataSource: DataSource) => {
        if (!tenantDataSource) {
          throw new Error('Accessing interviews without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(Interview);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    RecruitmentService,
  ],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
