import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global validation pipe with transform
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration for multi-tenant SaaS
  app.enableCors({
    origin: configService.get('app.environment') === 'production'
      ? [configService.get('app.frontendUrl')]
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('HRMS API')
    .setDescription('Multi-Tenant HR Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management')
    .addTag('Departments', 'Department management')
    .addTag('Positions', 'Position management')
    .addTag('Recruitment', 'Recruitment and hiring')
    .addTag('Payroll', 'Payroll and benefits')
    .addTag('Leave', 'Leave management')
    .addTag('Time', 'Time tracking and attendance')
    .addTag('Calendar', 'Calendar and events')
    .addTag('Messaging', 'Internal messaging')
    .addTag('Documents', 'Document management')
    .addTag('Dashboard', 'Dashboard and analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.get('port', 3000);
  await app.listen(port);

  console.log(`
    🚀 HRMS API Server is running!
    📝 API Documentation: http://localhost:${port}/api/docs
    🌐 API Endpoint: http://localhost:${port}/api/v1
    🔧 Environment: ${configService.get('app.environment')}
  `);
}
bootstrap();
