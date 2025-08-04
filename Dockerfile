# Use the official Node.js 18 image as the base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --prod

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from the base stage
COPY --from=base /app/next.config.mjs ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Expose the port the application will run on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]
