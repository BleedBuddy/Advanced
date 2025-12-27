# Use Node 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# Build the frontend (Vite/React)
# Assumes the frontend entry is in root and uses the default Vite build command
RUN npm run build

# Set the Cloud Run port
ENV PORT 8080
EXPOSE 8080

# Start the backend server
# Assumes your backend entry file is server/server.js
CMD ["node", "server/server.js"]
