# Étape 1 : Build Angular
FROM node:18-alpine AS builder

WORKDIR /app

# Config DNS + Registry
RUN npm config set registry https://registry.npmjs.org/

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer dépendances
RUN npm ci --force

# Copier tout le projet
COPY . .

# Build Angular (production)
RUN npm run build --prod

# Étape 2 : Serve avec Nginx
FROM nginx:alpine

# Copier build Angular vers Nginx
COPY --from=builder /app/dist/dashboard /usr/share/nginx/html

# (optionnel) copier un fichier nginx.conf custom
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
