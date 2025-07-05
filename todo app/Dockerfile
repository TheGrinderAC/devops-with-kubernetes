FROM node:alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN mkdir -p /app/storage && chown -R node:node /app/storage

CMD ["npm", "start"]
