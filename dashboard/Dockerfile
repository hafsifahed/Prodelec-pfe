# Étape 1 : Builder Angular
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer dépendances
RUN npm install --force

# Copier tout le code
COPY . .

# Build Angular (dist/dashboard)
RUN npm run build --prod

# Étape 2 : Servir avec Nginx
FROM nginx:alpine

# Copier build Angular dans Nginx
COPY --from=builder /app/dist/dashboard /usr/share/nginx/html

# Copier config nginx si besoin
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
