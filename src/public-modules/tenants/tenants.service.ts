import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './entities/tenant.entity/tenant.entity';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findTenantById(id: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async create(input: { name: string; schemaName: string }): Promise<TenantEntity> {
    const tenant = this.tenantRepository.create({ Name: input.name, schemaName: input.schemaName });
    return this.tenantRepository.save(tenant);
  }

  async findByName(name: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOne({ where: { Name: name } });
  }

  findUserByEmail(email: string): Promise<any> {
    return Promise.resolve(null);
  }

  async deleteTenant(id: string): Promise<void> {
    await this.tenantRepository.delete(id);
  }

  async provisionTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  }

  async saveTenantUser(
    schemaName: string,
    userData: { email: string; password: string; role: string; isActive: boolean; tenantId: string },
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.query(`SET search_path TO "${schemaName}"`);
      const repo = queryRunner.manager.getRepository(User);
      const user = repo.create({
        email: userData.email,
        password: userData.password,
        role: userData.role as any,
        isActive: userData.isActive,
        tenantId: userData.tenantId,
      });
      await repo.save(user);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
