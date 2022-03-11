FROM node:17.6-alpine

WORKDIR /app
COPY package*.json /app
RUN npm ci

RUN chown -R node:node /app
USER node

CMD npm run start
