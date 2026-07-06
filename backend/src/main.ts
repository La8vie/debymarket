import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as expressSanitizer from 'express-sanitizer';
import { loggerConfig } from './common/logger/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3001'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Input sanitization to prevent XSS attacks
  app.use(expressSanitizer());

  // Body size limits to prevent DoS attacks
  app.use((req: any, res: any, next: any) => {
    const contentLength = req.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      return res.status(413).json({ message: 'Payload too large' });
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
      // Additional security options
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    // Additional security headers
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // General rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts, please try again later.',
  });

  app.use('/auth/login', authLimiter);
  app.use('/auth/register', authLimiter);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Backend running on http://localhost:${port}`);
}
void bootstrap();
