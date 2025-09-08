# Étape 1 : Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --force

# Copier le reste du code
COPY . .

# Construire le projet (NestJS compile en dist/)
RUN npm run build

# Étape 2 : Exécuter
FROM node:18-alpine

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY package*.json ./
RUN npm install --only=production

# Copier les fichiers compilés depuis le builder
COPY --from=builder /app/dist ./dist

# Exposer le port (par défaut NestJS = 3000)
EXPOSE 3000

# Lancer l'app
CMD ["node", "dist/main.js"]
