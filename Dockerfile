FROM node:15.13-alpine as base

RUN apk add sqlite

WORKDIR /usr/src/app

RUN mkdir -p uploads

RUN npm install -g npm@7.8.0

COPY package*.json ./

ENV NODE_PATH=/app/node_modules

RUN npm install -g typescript tslint ts-jest typeorm

RUN npm install --save-dev sqlite3 jest

CMD ["npm", "run", "dev"]

FROM base as prod

COPY . .

RUN npm install

RUN npm run build

RUN cp -r api-docs dist/api-docs

CMD ["npm", "run", "start"]

