/**
 * Coffee Digital Passport API - Main Application Entry Point
 * NestJS application with Fastify platform for high performance
 */

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_FILTER } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

/**
 * Bootstrap the Coffee Digital Passport API
 */
async function bootstrap() {
  try {
    // Create NestJS application with Fastify
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        logger: false,
        trustProxy: true,
      })
    );

    // Get configuration service
    const configService = app.get(ConfigService);
    // Use PORT from environment (Railway provides this) or default to 4000
    const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 4000;
    const environment = configService.get<string>('NODE_ENV', 'development');

    // Enable CORS - Allow all origins for mobile app development
    app.enableCors({
      origin: '*', // Allow all origins for mobile app access
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Swagger documentation (development only)
    // Disabled for now due to metadata issues
    // if (environment === 'development') {
    //   const config = new DocumentBuilder()
    //     .setTitle('Coffee Digital Passport API')
    //     .setDescription('Standards-first traceability platform for coffee supply chains')
    //     .setVersion('1.0.0')
    //     .addTag('epcis', 'EPCIS event capture and management')
    //     .addTag('passport', 'Digital passport generation and access')
    //     .addBearerAuth()
    //     .build();

    //   const document = SwaggerModule.createDocument(app, config);
    //   SwaggerModule.setup('api/docs', app, document);
    // }



    // Start the application
    await app.listen(port, '0.0.0.0');
    
    console.log(`Coffee Digital Passport API running on port ${port} in ${environment} mode`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}, shutting down gracefully`);
      
      try {
        await app.close();
        console.log('Application closed successfully');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();
