FROM node:20-alpine

WORKDIR /app

# Copy package files from repository root when build context is the repo root
# If the builder sets the build context to the repository root and the Dockerfile
# path is Backend/Dockerfile, COPY must reference files relative to the build context.
COPY Backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY Backend/ .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Use production start script
CMD ["npm", "start"]

