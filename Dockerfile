# Use an official Node runtime as a parent image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code (optional if using ts-node in production)
RUN npm run build || echo "No build script provided, using ts-node"

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]