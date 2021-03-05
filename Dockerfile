FROM node:15.8-alpine as base

WORKDIR /usr/src/app

RUN apk add sqlite

COPY package*.json ./

ENV NODE_PATH=/app/node_modules

RUN npm install -g typescript tslint ts-jest

RUN npm install sqlite3 --save

RUN npm install --save ts-jest

FROM base as dev

RUN npm install -g jest

FROM base as prod

COPY . .

RUN npm install

RUN tsc --project ./

RUN cp -r api-docs dist/api-docs

CMD ["npm", "run", "start"]
