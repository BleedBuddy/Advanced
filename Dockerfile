# Use Node.js 20 LTS image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# Build the frontend (React / Vite)
RUN npm run build --prefix .

# Expose the port Cloud Run expects
ENV PORT 8080
EXPOSE 8080

# Start the backend server
CMD ["node", "server/server.js"]


