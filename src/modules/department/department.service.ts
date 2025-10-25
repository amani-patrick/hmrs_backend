import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { User } from '../users/entities/user.entity';
import { Position } from '../position/entities/position.entity';

@Injectable()
export class DepartmentRealService {
  constructor(
    @Inject('DEPARTMENT_REPOSITORY')
    private readonly departmentRepository: Repository<Department>,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('POSITION_REPOSITORY')
    private readonly positionRepository: Repository<Position>,
  ) {}

  async findAll(tenantId: string): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { tenantId },
      relations: ['head'],
      order: { name: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id, tenantId },
      relations: ['head'],
    });
    
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    
    return department;
  }

  async create(tenantId: string, createDto: any): Promise<Department> {
    const departmentData = {
      ...createDto,
      tenantId,
    };
    
    const department = this.departmentRepository.create(departmentData) as unknown as Department;
    const savedDepartment = await this.departmentRepository.save(department);
    
    return savedDepartment;
  }

  async update(tenantId: string, id: string, updateDto: any): Promise<Department> {
    const department = await this.findOne(tenantId, id);
    
    Object.assign(department, updateDto);
    
    return this.departmentRepository.save(department);
  }

  async delete(tenantId: string, id: string): Promise<{ message: string; department: Department }> {
    const department = await this.findOne(tenantId, id);
    
    // Check if department has employees
    const employeeCount = await this.userRepository.count({
      where: { tenantId, departmentId: id, isActive: true },
    });
    
    if (employeeCount > 0) {
      throw new Error(`Cannot delete department with ${employeeCount} active employees`);
    }
    
    await this.departmentRepository.remove(department);
    
    return { message: 'Department deleted successfully', department };
  }

  async getStats(tenantId: string, id: string): Promise<any> {
    const department = await this.findOne(tenantId, id);
    
    const employees = await this.userRepository.find({
      where: { tenantId, departmentId: id, isActive: true },
      relations: ['position'],
    });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.isActive).length;

    // Calculate average salary if available (User entity doesn't have salary field)
    // Would need to join with payroll or salary grade data
    const averageSalary = 0; // Placeholder

    // Count open positions
    const openPositions = await this.positionRepository.count({
      where: { tenantId, departmentId: id, isActive: true },
    });

    // TODO: Add attendance and performance calculations when those modules are integrated
    const attendanceRate = 0; // Placeholder
    const performanceScore = 0; // Placeholder

    return {
      departmentId: id,
      name: department.name,
      totalEmployees,
      activeEmployees,
      averageSalary: Math.round(averageSalary),
      openPositions,
      attendanceRate,
      performanceScore,
    };
  }

  async getEmployees(tenantId: string, departmentId: string): Promise<User[]> {
    await this.findOne(tenantId, departmentId); // Verify department exists

    return this.userRepository.find({
      where: { tenantId, departmentId, isActive: true },
      relations: ['position', 'manager'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async getPositions(tenantId: string, departmentId: string): Promise<Position[]> {
    await this.findOne(tenantId, departmentId); // Verify department exists

    return this.positionRepository.find({
      where: { tenantId, departmentId, isActive: true },
      order: { title: 'ASC' },
    });
  }
}
