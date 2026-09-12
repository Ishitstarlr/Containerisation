FROM node:20

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

EXPOSE 80
CMD ["npx", "serve", "-s", "dist", "-l", "80"]