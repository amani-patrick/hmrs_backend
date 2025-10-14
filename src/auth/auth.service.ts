import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { TenantsService } from '../public-modules/tenants/tenants.service';
import { UsersService } from '../modules/users/users.service';
import { Role } from '../common/enums/roles.enum';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
 
  ) {}

  async registerTenant(dto: RegisterTenantDto) {
    // Validate tenant name uniqueness
    const existingTenant = await this.tenantsService.findByName(dto.Name);
    if (existingTenant) {
      throw new ConflictException('Tenant with this name already exists');
    }

    // Validate email uniqueness globally
    const existingUser = await this.tenantsService.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const schemaName = 'tenant_' + dto.Name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const tenant = await this.tenantsService.create({
      name: dto.Name,
      schemaName: schemaName,
    });
    
    try {
      await this.tenantsService.provisionTenantSchema(tenant.schemaName);

      const hashedPassword = await bcrypt.hash(dto.password, 12);
      
      await this.tenantsService.saveTenantUser(tenant.schemaName, {
          email: dto.email,
          password: hashedPassword,
          role: Role.ADMIN,
          isActive: true,
          tenantId: tenant.id
      });
      
      const payload: JwtPayload = {
        userId: tenant.id, // First user ID would be generated, using tenant ID for now
        tenantId: tenant.id,
        role: Role.ADMIN,
        email: dto.email
      };
      
      const token = await this.jwtService.signAsync(payload);
      
      return {
        tenantId: tenant.id,
        accessToken: token,
        message: `Tenant ${tenant.Name} provisioned successfully.`,
      };
    } catch (error) {
      // Cleanup on failure
      await this.tenantsService.deleteTenant(tenant.id);
      throw new BadRequestException('Failed to provision tenant');
    }
  }
  

  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId || '', 
      role: user.role,
      email: user.email
    };

    const token = await this.jwtService.signAsync(payload);
    return { 
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    };
  }
}