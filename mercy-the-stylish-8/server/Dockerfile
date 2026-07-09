FROM node:22-alpine AS build
WORKDIR /app
COPY .npmrc package.json package-lock.json* ./
COPY prisma.config.ts ./
COPY prisma ./prisma
ENV DATABASE_URL=postgresql://mercy:mercy@postgres:5432/mercy?schema=public
RUN npm install || (sleep 5 && npm install)
RUN ./node_modules/.bin/prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY .npmrc package.json package-lock.json* ./
COPY prisma.config.ts ./
COPY prisma ./prisma
ENV DATABASE_URL=postgresql://mercy:mercy@postgres:5432/mercy?schema=public
RUN npm install --omit=dev || (sleep 5 && npm install --omit=dev)
RUN ./node_modules/.bin/prisma generate
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
EXPOSE 4000
CMD ["node", "dist/index.js"]
