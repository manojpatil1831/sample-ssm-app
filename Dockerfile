FROM node:20-alpine

# Set build directory and production node environment
WORKDIR /app
ENV NODE_ENV=production

# Copy lock files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application assets and source code
COPY . .

# Expose port and start node server
EXPOSE 3000
CMD ["node", "server.js"]
