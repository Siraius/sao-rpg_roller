FROM node:20-bookworm


WORKDIR /app


# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm install


# Copy the rest of your code
COPY . .

RUN chmod +x /app/entrypoint.sh

# Expose Next.js dev server port
EXPOSE 3000


ENV NODE_ENV=development


# Start Next.js in development mode (hot reload)
CMD ["npm", "run", "dev"]
