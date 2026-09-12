FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "start"]
