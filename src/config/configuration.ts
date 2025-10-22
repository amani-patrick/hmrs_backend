export default () => ({
    port: parseInt(process.env.PORT as string, 10) || 3000,
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      name: process.env.DB_NAME || 'hrms_db',
      public_schema: process.env.DB_PUBLIC_SCHEMA || 'public',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true' || false,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'your-refresh-secret-key',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    app: {
      name: process.env.APP_NAME ?? 'HRMS API',
      version: process.env.APP_VERSION ?? '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
      frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      apiUrl: process.env.API_URL ?? 'http://localhost:3000',
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS as string, 10) || 12,
      rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL as string, 10) || 60,
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 100,
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT as string, 10) || 587,
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM ?? 'noreply@hrms.com',
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER ?? 'local',
      localPath: process.env.STORAGE_LOCAL_PATH ?? './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE as string, 10) || 10485760, // 10MB
    },
  });