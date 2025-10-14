import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/roles.enum';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique identifier of the user' })
  id: string;

  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
  email: string;

  @ApiProperty({ 
    enum: Role, 
    enumName: 'Role',
    description: 'User role in the system',
    example: Role.EMPLOYEE
  })
  role: Role;

  @ApiProperty({ 
    description: 'Indicates if the user account is active',
    example: true 
  })
  isActive: boolean;

  @ApiProperty({ 
    description: 'First name of the user',
    required: false,
    example: 'John',
    nullable: true
  })
  firstName?: string | null;

  @ApiProperty({ 
    description: 'Last name of the user',
    required: false,
    example: 'Doe',
    nullable: true
  })
  lastName?: string | null;

  @ApiProperty({ 
    description: 'Job position of the user',
    required: false,
    example: 'Software Developer',
    nullable: true
  })
  position?: string | null;

  @ApiProperty({ 
    description: 'Date when the user joined',
    type: Date,
    example: '2023-01-01T00:00:00.000Z',
    nullable: true
  })
  joinedAt?: Date | null;

  @ApiProperty({ 
    description: 'Emergency contact information',
    required: false,
    example: '+1234567890',
    nullable: true
  })
  emergencyContact?: string | null;

  @ApiProperty({ 
    description: 'Phone number of the user',
    required: false,
    example: '+1234567890',
    nullable: true
  })
  phoneNumber?: string | null;

  @ApiProperty({ 
    description: 'Date when the user was hired',
    type: Date,
    required: false,
    example: '2023-01-01T00:00:00.000Z',
    nullable: true
  })
  hireDate?: Date | null;

  @ApiProperty({ 
    description: 'User salary',
    type: Number,
    required: false,
    example: 75000.00,
    nullable: true
  })
  salary?: number | null;
}
