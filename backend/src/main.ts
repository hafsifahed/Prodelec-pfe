import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your Angular frontend
  app.enableCors({
    origin: true, // ou mettez l'URL exacte de votre frontend Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // si vous utilisez cookies ou headers d'auth
  });

  app.use(express.json()); // indispensable pour parser les bodies JSON
  app.use(express.urlencoded({ extended: true }));

  // Validation globale des DTOs avec whitelist pour supprimer les propriétés non définies
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Servir le dossier uploads comme statique accessible via /uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Démarrage de l'application sur le port défini dans la variable d'environnement PORT
  //   await app.listen(parseInt(process.env.PORT));
  await app.listen(parseInt(process.env.PORT, 10) || 3000);
}

bootstrap();
