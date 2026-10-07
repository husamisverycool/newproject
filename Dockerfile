# The Node build of roll. as one service: the API (Hono, node:sqlite, sharp) serving the built PWA.
# Data (the SQLite file, photos, Web Push keys) lives in DATA_DIR; mount a persistent disk there.
FROM node:22.20.0-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN npm ci
COPY . .
RUN npm run build
ENV DATA_DIR=/data PORT=8787 DEMO=0
EXPOSE 8787
CMD ["npm", "start"]
