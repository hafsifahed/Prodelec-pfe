# Étape 1 : Build
FROM node:18-alpine AS builder

WORKDIR /app

# Config DNS + Registry
RUN npm config set registry https://registry.npmjs.org/

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer dépendances
RUN npm ci --force

# Copier le reste du code
COPY . .

# Build du projet NestJS
RUN npm run build

# Étape 2 : Run
FROM node:18-alpine

WORKDIR /app

RUN npm config set registry https://registry.npmjs.org/

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer uniquement les dépendances nécessaires pour la prod
RUN npm ci --only=production --force

# Copier les fichiers buildés depuis builder
COPY --from=builder /app/dist ./dist

# Exposer le port NestJS
EXPOSE 3000

CMD ["node", "dist/main.js"]
