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
  });