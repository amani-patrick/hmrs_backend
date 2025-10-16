import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, MoreThanOrEqual, Like, In, Not, IsNull } from 'typeorm';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { DirectoryFiltersDto } from './dto/directory-filters.dto';
import { EmployeeDirectoryDto } from './dto/employee-directory.dto';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { CreateUserDto, CompleteSignupDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { EmployeeStatsResponseDto } from './dto/employee-stats-response.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async createInvitedUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, role = Role.EMPLOYEE } = createUserDto;
    
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists in this Organization');
    }
    
    const newUser = this.userRepository.create({
      email,
      role,
      isActive: false,
    });
    
    // Send a unique signup link
    
    return this.userRepository.save(newUser);
  }

  async getEmployeeDirectory(filters: DirectoryFiltersDto): Promise<EmployeeDirectoryDto[]> {
    const { departmentId, search, location } = filters;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.position', 'position')
      .where('user.role != :adminRole', { adminRole: 'admin' })
      .andWhere('user.isActive = :isActive', { isActive: true });

    if (departmentId) {
      query.andWhere('user.departmentId = :departmentId', { departmentId });
    }

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(user.firstName) LIKE :search OR ' +
        'LOWER(user.lastName) LIKE :search OR ' +
        'LOWER(user.email) LIKE :search OR ' +
        'LOWER(position.title) LIKE :search)',
        { search: searchTerm }
      );
    }

    if (location) {
      query.andWhere('LOWER(user.location) LIKE :location', { 
        location: `%${location.toLowerCase()}%` 
      });
    }

    const users = await query.getMany();

    return users.map(user => {
      const positionTitle = user.position || (user.positionRef as any)?.title || 'Not specified';
      
      return {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        positionTitle,
        departmentName: user.department?.name || 'Not assigned',
        location: user.location || 'Not specified',
        profilePictureUrl: user.profilePictureUrl || '',
        isActive: user.isActive,
      } as EmployeeDirectoryDto;
    });
  }

  async exportEmployeeDirectory(filters: DirectoryFiltersDto): Promise<Buffer> {
    const employees = await this.getEmployeeDirectory(filters);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employee Directory');
    
    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Position', key: 'position', width: 30 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Location', key: 'location', width: 25 },
    ];

    // Add data rows
    employees.forEach(employee => {
      worksheet.addRow({
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        phone: employee.phoneNumber,
        position: employee.positionTitle,
        department: employee.departmentName,
        location: employee.location,
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneOrFail({ 
      where: { email },
      select: ['id', 'email', 'role', 'password'],
    });
  }

  async completeSignup(userId: string, completeSignupDto: CompleteSignupDto): Promise<User> {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      user.password = await bcrypt.hash(completeSignupDto.password, 12);
      user.isActive = true;
      user.firstName = completeSignupDto.firstName;
      user.lastName = completeSignupDto.lastName;
      user.position = completeSignupDto.position || 'Employee';
      
      return this.userRepository.save(user);
  }

  async findAllUsersInTenant(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'role', 'isActive', 'firstName', 'lastName', 'position', 'joinedAt', 'tenantId'],
    });
    return plainToInstance(UserResponseDto, users);
  }
  async findAllEmployees(): Promise<UserResponseDto[]> {
    const employees = await this.userRepository.find({
      where: { isActive: true, role: Role.EMPLOYEE },
      relations: ['departments', 'position']
    });
    return plainToInstance(UserResponseDto, employees);
  }

  async deactivateUser(userId: string): Promise<boolean> {
    const result = await this.userRepository.update(userId, { isActive: false });
    return result?.affected ? result.affected > 0 : false;
  }

  async getEmployeeStats(currentDate: Date): Promise<EmployeeStatsResponseDto> {
    const totalEmployees = await this.userRepository.count({ where: { isActive: true } });
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Since we don't have hireDate in the entity, we'll use joinedAt as a fallback
    const newThisMonth = await this.userRepository.count({
      where: {
        isActive: true,
        joinedAt: MoreThanOrEqual(startOfMonth),
      },
    });

    // Since we don't have salary in the entity, we'll return 0 for average salary
    const stats = new EmployeeStatsResponseDto({
      totalEmployees,
      activeEmployees: totalEmployees,
      newThisMonth,
      averageSalary: '0.00',
    });
    
    return stats;
  }

  async findOneById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role', 'isActive', 'firstName', 'lastName', 'position', 'joinedAt', 'tenantId'],
    });
    return user ? plainToInstance(UserResponseDto, user) : null;
  }
}