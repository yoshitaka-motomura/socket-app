FROM node:20-slim as dependencies
LABEL org.opencontainers.image.source=https://github.com/yoshitaka-motomura/socket-app
LABEL org.opencontainers.image.description="socket.io app multi arch docker image"
LABEL org.opencontainers.image.licenses=MIT

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

FROM node:20-slim as builder
WORKDIR /usr/src/app
COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
RUN npm run build

FROM node:20-slim as production
WORKDIR /app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]
