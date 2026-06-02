# Stage 1: Build Vite React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run production Express backend server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
