import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: ['https://stock-clustering-frontend-128835725394.asia-southeast1.run.app', 'http://localhost:5173', 'http://localhost:5174','http://localhost:4173','https://stock-clustering-frontend.vercel.app'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Stock Clustering Api')
    .setDescription('Yuck!!!')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();