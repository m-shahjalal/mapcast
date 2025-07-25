FROM node:20-bookworm-slim

# Install Git and clean up
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

# Install dependencies
RUN npm install pnpm --global
RUN pnpm install --force

EXPOSE 8080
CMD ["npm", "run", "start:hono"]