import { PartialType } from '@nestjs/swagger';
import { CreateComplianceReportDto } from './create-compliance-report.dto';

export class UpdateComplianceReportDto extends PartialType(CreateComplianceReportDto) {}
