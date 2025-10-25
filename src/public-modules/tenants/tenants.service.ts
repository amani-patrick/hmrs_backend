import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './entities/tenant.entity/tenant.entity';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

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

  async create(input: { 
    name: string; 
    schemaName: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    trialStartDate?: Date;
    trialEndDate?: Date;
    billingCycle?: string;
  }): Promise<TenantEntity> {
    const tenant = this.tenantRepository.create({ 
      name: input.name, 
      schemaName: input.schemaName,
      subscriptionPlan: input.subscriptionPlan,
      subscriptionStatus: input.subscriptionStatus || 'trial',
      trialStartDate: input.trialStartDate,
      trialEndDate: input.trialEndDate,
      billingCycle: input.billingCycle,
    });
    return this.tenantRepository.save(tenant);
  }

  async findByName(name: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOne({ where: { name: name } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    // Search across all tenant schemas for the email
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Set search path to public first
      await queryRunner.query(`SET search_path TO public`);
      
      // Get all tenants
      const tenants = await this.tenantRepository.find();
      
      // Check each tenant schema
      for (const tenant of tenants) {
        try {
          await queryRunner.query(`SET search_path TO "${tenant.schemaName}"`);
          const user = await queryRunner.manager
            .getRepository(User)
            .findOne({ 
              where: { email },
              select: ['id', 'email', 'password', 'role', 'isActive', 'tenantId', 'firstName', 'lastName']
            });
          
          if (user) {
            return user;
          }
        } catch (error) {
          // Skip this tenant if users table doesn't exist yet
          continue;
        }
      }
      
      await queryRunner.query(`SET search_path TO public`);
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserById(userId: string, tenantId: string): Promise<User | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Find tenant to get schema name
      const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
      if (!tenant) {
        return null;
      }

      // Set search path to tenant schema
      await queryRunner.query(`SET search_path TO "${tenant.schemaName}"`);
      
      const user = await queryRunner.manager
        .getRepository(User)
        .findOne({ 
          where: { id: userId },
          select: ['id', 'email', 'role', 'isActive', 'tenantId', 'firstName', 'lastName', 'position', 'phoneNumber', 'location']
        });
      
      await queryRunner.query(`SET search_path TO public`);
      return user;
    } catch (error) {
      await queryRunner.query(`SET search_path TO public`);
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTenant(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Ensure we're in the public schema and delete directly
      await queryRunner.query(`SET search_path TO public`);
      await queryRunner.query(`DELETE FROM "tenants" WHERE "id" = $1`, [id]);
    } finally {
      await queryRunner.release();
    }
  }

  async provisionTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Ensure UUID extension is available in public schema
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public`);
      
      // Create the schema
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      
      // Set search path to include both tenant schema and public for extensions
      await queryRunner.query(`SET search_path TO "${schemaName}", public`);
      
      // Synchronize entities to create tables in the tenant schema
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "email" character varying NOT NULL,
          "password" text,
          "role" character varying NOT NULL,
          "isActive" boolean NOT NULL DEFAULT true,
          "firstName" character varying,
          "lastName" character varying,
          "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "position" character varying,
          "phoneNumber" character varying,
          "location" character varying,
          "profilePictureUrl" text,
          "positionId" uuid,
          "tenantId" uuid,
          "departmentId" uuid,
          "salaryGradeId" uuid,
          "invitationToken" character varying,
          "invitationExpiry" TIMESTAMP,
          CONSTRAINT "PK_users_${schemaName}" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_email_${schemaName}" UNIQUE ("email")
        )
      `);
      
      // Reset search path
      await queryRunner.query(`SET search_path TO public`);
    } finally {
      await queryRunner.release();
    }
  }

  async saveTenantUser(
    schemaName: string,
    userData: { email: string; password: string; role: string; isActive: boolean; tenantId: string; firstName?: string; lastName?: string },
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
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
      });
      await repo.save(user);
      await queryRunner.commitTransaction();
      await queryRunner.query(`SET search_path TO public`);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.query(`SET search_path TO public`);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserByInvitationToken(token: string): Promise<{ user: User; schemaName: string } | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      await queryRunner.query(`SET search_path TO public`);
      const tenants = await this.tenantRepository.find();
      
      for (const tenant of tenants) {
        try {
          await queryRunner.query(`SET search_path TO "${tenant.schemaName}"`);
          const user = await queryRunner.manager
            .getRepository(User)
            .findOne({ 
              where: { invitationToken: token },
              select: ['id', 'email', 'role', 'invitationExpiry', 'isActive', 'tenantId']
            });
          
          if (user) {
            await queryRunner.query(`SET search_path TO public`);
            return { user, schemaName: tenant.schemaName };
          }
        } catch (error) {
          continue;
        }
      }
      
      await queryRunner.query(`SET search_path TO public`);
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async completeUserSignup(
    token: string,
    userData: { firstName: string; lastName: string; password: string; phoneNumber: number; Address: string; dob: string; position: string; Emergency_contact?: string; skills?: string[]; bio?: string }
  ): Promise<User> {
    const result = await this.findUserByInvitationToken(token);
    
    if (!result) {
      throw new Error('Invalid invitation token');
    }

    const { user, schemaName } = result;

    if (user.invitationExpiry && user.invitationExpiry < new Date()) {
      throw new Error('Invitation token has expired');
    }

    if (user.isActive) {
      throw new Error('User account is already active');
    }

    
    // Hash the password
    let bcrypt_rounds= process.env.BCRYPT_ROUNDS || 10;
    const hashedPassword = await bcrypt.hash(userData.password, bcrypt_rounds);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      await queryRunner.startTransaction();
      await queryRunner.query(`SET search_path TO "${schemaName}"`);
      
      await queryRunner.manager
        .getRepository(User)
        .update(
          { id: user.id },
          {
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: hashedPassword,
            phoneNumber: userData.phoneNumber.toString(),
            location: userData.Address,
            position: userData.position,
            isActive: true,
            invitationToken: null,
            invitationExpiry: null,
          }
        );

      const updatedUser = await queryRunner.manager
        .getRepository(User)
        .findOne({ where: { id: user.id } });

      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user');
      }

      await queryRunner.commitTransaction();
      await queryRunner.query(`SET search_path TO public`);
      
      return updatedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.query(`SET search_path TO public`);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
