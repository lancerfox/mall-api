import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3005',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
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

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('商城后台管理系统 API')
    .setDescription('基于 NestJS + MongoDB 的商城后台管理系统 API 文档')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    // .addTag('认证管理', '用户登录、注册、权限验证相关接口')
    // .addTag('用户管理', '系统用户的增删改查操作')
    // .addTag('菜单管理', '系统菜单的管理和权限控制')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;

  await app.listen(port);
  // 打印数据库连接信息
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbUsername = process.env.DB_USERNAME;
  const dbDatabase = process.env.DB_DATABASE;
  const dbType = process.env.DB_TYPE;

  if (dbHost && dbPort && dbUsername && dbDatabase) {
    // 安全地显示数据库连接信息（隐藏密码）
    console.log(
      `🗄️  Database connection: ${dbType}://${dbUsername}:***@${dbHost}:${dbPort}/${dbDatabase}`,
    );
  } else {
    console.log('⚠️  Database connection: Database configuration incomplete');
  }
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
