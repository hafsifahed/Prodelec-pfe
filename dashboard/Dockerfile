# Étape 1 : Build Angular
FROM node:18-alpine AS builder

WORKDIR /app

# Config registry NPM
RUN npm config set registry https://registry.npmjs.org/

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer dépendances
RUN npm ci --force

# Copier tout le projet
COPY . .

# Build Angular prod
RUN npm run build --prod

# Étape 2 : Nginx
FROM nginx:alpine

# Copier build Angular dans Nginx
COPY --from=builder /app/dist/dashboard /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
