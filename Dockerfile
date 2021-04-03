FROM node:15.13-alpine as base

WORKDIR /usr/src/app

RUN mkdir -p uploads

RUN npm install -g npm@7.8.0

RUN apk add sqlite

COPY package*.json ./

ENV NODE_PATH=/app/node_modules

RUN npm install -g typescript tslint ts-jest typeorm

RUN npm install sqlite3 jest --save

FROM base as dev

FROM base as prod

COPY . .

RUN npm install

RUN tsc --project ./

RUN cp -r api-docs dist/api-docs

CMD ["npm", "run", "start"]
