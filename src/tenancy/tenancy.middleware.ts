import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../public-modules/tenants/tenants.service';
import { TENANT_CONTEXT, ITenantContext } from './tenancy.interface';


export const currentTenantStore = new Map<string, ITenantContext>();

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return next(); 
    }

    const tenant = await this.tenantsService.findTenantById(tenantId);
    if (!tenant) {
      throw new UnauthorizedException('Invalid or unknown Tenant ID');
    }
    const tenantContext: ITenantContext = {
        tenantId: tenant.id,
        schemaName: tenant.schemaName,
    };
    
    req[TENANT_CONTEXT] = tenantContext; 

    next();
  }
}