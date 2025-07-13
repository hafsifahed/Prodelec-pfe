import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as os from 'os';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour votre frontend Angular (adapter l'origine selon besoin)
  app.enableCors({
    origin: true, // ou 'http://localhost:4200' pour restreindre l'accès
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // Parsing JSON et URL-encoded (Nest le fait par défaut, mais c'est ok de le préciser)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Validation globale avec whitelist pour retirer les propriétés non définies dans les DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Servir les images statiques partenaires
  app.use(
    '/uploads/partners',
    express.static(join(os.homedir(), 'Downloads', 'uploads', 'partners','ProfileImages')),
  );

  // Servir les images statiques utilisateurs (attention au chemin correct)
  app.use(
    '/uploads/users/ProfileImages',
    express.static(join(os.homedir(), 'Downloads', 'uploads', 'users', 'ProfileImages')),
  );

  // Démarrage de l'application
  const port = parseInt(process.env.PORT, 10) || 3000;
  await app.listen(port);
  console.log(`Application démarrée sur le port ${port}`);
}

bootstrap();
