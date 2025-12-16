FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions first (for caching)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY index.js ./

EXPOSE 3000

CMD ["node", "index.js"]
