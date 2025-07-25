FROM node:20-bookworm-slim

# Install Git and other dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app
RUN npm install --force
CMD ["npm", "run", "start:hono"]