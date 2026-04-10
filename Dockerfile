FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev && npm rebuild better-sqlite3
COPY --from=build /app/dist ./dist
COPY server ./server
RUN mkdir -p data
EXPOSE 3002
ENV NODE_ENV=production
ENV PORT=3002
CMD ["node", "server/index.js"]
