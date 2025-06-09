import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  

  // Enable CORS for your Angular frontend
  app.enableCors({
    origin:true, //'http://localhost:4200' Angular app URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // if you use cookies or auth headers
  });

    app.use(express.json()); // indispensable pour parser les bodies JSON
  app.use(express.urlencoded({ extended: true })); 
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('App')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('app')
    .build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(parseInt(process.env.PORT));
}
bootstrap();
