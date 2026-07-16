FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/index.js"]
