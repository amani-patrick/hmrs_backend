import { ApiProperty } from '@nestjs/swagger';

export class EmployeeDirectoryDto {
  @ApiProperty({ description: 'Unique identifier of the employee' })
  id: string;

  @ApiProperty({ description: 'First name of the employee' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the employee' })
  lastName: string;

  @ApiProperty({ description: 'Email address of the employee' })
  email: string;

  @ApiProperty({ description: 'Phone number of the employee' })
  phoneNumber: string;

  @ApiProperty({ description: 'Job title/position of the employee' })
  positionTitle: string;

  @ApiProperty({ description: 'Name of the department the employee belongs to' })
  departmentName: string;

  @ApiProperty({ description: 'Location/office of the employee' })
  location: string;

  @ApiProperty({ description: 'URL to the employee\'s profile picture' })
  profilePictureUrl?: string;

  @ApiProperty({ description: 'Employee status (active/inactive)' })
  isActive: boolean;
}
