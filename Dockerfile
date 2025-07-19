FROM node:22-alpine

# Install pnpm globally
RUN npm install pnpm --global

# Set working directory to /app
WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Build the application
RUN pnpm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000
CMD ["pnpm", "start"]