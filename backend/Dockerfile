# Étape 1 : Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Config registry NPM pour CI/CD stable
RUN npm config set registry https://registry.npmjs.org/

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer dépendances
RUN npm ci --force

# Copier le reste du code
COPY . .

# Build NestJS
RUN npm run build

# Étape 2 : Run
FROM node:18-alpine

WORKDIR /app

RUN npm config set registry https://registry.npmjs.org/

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer dépendances prod
RUN npm ci --only=production --force

# Copier le build
COPY --from=builder /app/dist ./dist

# Copier .env
COPY --from=builder /app/.env ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
