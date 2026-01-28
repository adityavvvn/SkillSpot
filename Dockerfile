# Stage 1: Build the React Client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Server
FROM node:18-alpine
WORKDIR /app

# Copy server dependencies first for caching
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy server code
COPY server/ ./

# Copy built client assets from the builder stage
# We place them in a folder that maps to where server.js expects them (../client/build relative to server.js)
# server.js is in /app/server, so ../client/build resolves to /app/client/build
COPY --from=client-build /app/client/build ../client/build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
