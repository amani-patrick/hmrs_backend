import { DataSource } from 'typeorm';
import { ComplianceReport } from './entities/compliance-report.entity';
import { RiskAssessment } from './entities/risk-assessment.entity';
import { SecurityEvent } from './entities/security-event.entity';
import { DataAccessLog } from './entities/data-access-log.entity';
import { PolicyViolation } from './entities/policy-violation.entity';
import { AuditLog } from '../../common/entities/audit-log.entity';

export const auditProviders = [
  {
    provide: 'COMPLIANCE_REPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ComplianceReport),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'RISK_ASSESSMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RiskAssessment),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SECURITY_EVENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SecurityEvent),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'DATA_ACCESS_LOG_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(DataAccessLog),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'POLICY_VIOLATION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PolicyViolation),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'AUDIT_LOG_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AuditLog),
    inject: ['DATA_SOURCE'],
  },
];
