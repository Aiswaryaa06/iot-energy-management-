# simulator/Dockerfile
FROM node:18-slim

ENV NODE_ENV=production
ENV API_URL=http://backend:5000/api
ENV INTERVAL_MS=5000

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

CMD ["npm", "start"]
