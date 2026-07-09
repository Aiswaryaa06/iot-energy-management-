# backend/Dockerfile
FROM node:18-slim

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (using package.json and package-lock.json if available)
COPY package*.json ./
RUN npm install --omit=dev

# Copy app source code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
