FROM node:20-alpine AS dependencies

WORKDIR /app

# Prisma requires OpenSSL both while generating and at runtime.
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

# Keep the runtime image to the Node runtime, production dependencies, and the
# OpenSSL library required by Prisma; build caches and dev dependencies stay out.
RUN apk add --no-cache openssl

COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
