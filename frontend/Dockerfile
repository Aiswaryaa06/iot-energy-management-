# frontend/Dockerfile
# Stage 1: Build the React application
FROM node:20-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Set env for build (can point to production API or relative endpoint)
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy built assets from Stage 1
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React Router routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
