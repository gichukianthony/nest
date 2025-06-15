import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { LoggerMiddleware } from './loger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Helmet for security
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: '*', // Adjust this to your needs
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Logger middleware
  app.use(new LoggerMiddleware().use);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('🚗 Vehicle Breakdown Assistance Management API')
    .setDescription(
      `
Welcome to the Vehicle Breakdown Assistance Management API documentation. This API provides endpoints for managing vehicle breakdown assistance, users, mechanics, and services.

## 🧑‍💻 Modules Overview

### 🔐 **Auth**
- Register or log in as a **User** or **Mechanic**
- Secure access with JWT (Bearer Token)

### 👤 **Users**
- Register new users
- View approved mechanics based on location/service
- Request service from a mechanic
- Post service feedback

### 🧰 **Mechanics**
- Register and await admin approval
- Update service offerings
- View received feedback

### 💬 **Feedbacks**
- Submit feedback with rating & comments after service completion
- View mechanic ratings and reviews

### 🛠️ **Services**
- Users submit breakdown service requests
- Mechanics accept/complete service requests
- Admin monitors all service activity

## 🔐 Security and Authorization

All secured routes **require a Bearer Token**. Use the 🔓 **Authorize** button at the top of this page to provide your token.

\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## 🛡️ Security Best Practices

- All passwords are hashed using **bcrypt**
- Role-based access: Admin, User, and Mechanic have defined permissions
- All input fields are validated to avoid injection attacks

## 📚 Need Help?

For full documentation, try the interactive endpoints below
    `,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Mechanics', 'Mechanic management endpoints')
    .addTag('Feedbacks', 'Feedback management endpoints')
    .addTag('Services', 'Service management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        theme: 'monokai',
      },
    },
    customSiteTitle:
      '🚗 Vehicle Breakdown Assistance Management API Documentation',
    customfavIcon: 'https://your-domain.com/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
    customCss: `
      .swagger-ui .topbar { display: none; }
    `,
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
