export default () => ({
    port: parseInt(process.env.PORT as string, 10) || 3000,
    database: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
      public_schema: process.env.DB_PUBLIC_SCHEMA || 'public',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
    },
    app: {
      name: process.env.APP_NAME ?? 'HRMS API',
      version: process.env.APP_VERSION ?? '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    },
  });