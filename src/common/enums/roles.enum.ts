export enum Role {
    // Platform-level: Exists only in the 'public' schema
    SUPER_ADMIN = 'super_admin', 
    

    ADMIN = 'admin',      // Organization Administrator
    MANAGER = 'manager',
    HR = 'hr',
    TRAINER = 'trainer',
    AUDITOR = 'auditor',
    EMPLOYEE = 'employee',


    BILLING = 'billing',
  }
  
  // A helper type for roles within a tenant
  export type TenantRole = Exclude<Role, Role.SUPER_ADMIN>;