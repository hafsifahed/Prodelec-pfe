# Stage 1: Build the Angular application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./



# Copy the rest of the application code
COPY . .

RUN npm install --force
RUN npm run build 


# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built application from the previous stage
COPY --from=build /app/dist/Prodelec /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d
# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
