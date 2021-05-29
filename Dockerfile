FROM node:15.13-alpine as base

RUN npm install -g npm@7.11.2

WORKDIR /usr/src/app

COPY package*.json ./

FROM base as dev

RUN npm install -g typescript tslint ts-jest typeorm ts-node jest ts-jest nodemon prisma

RUN mkdir -p uploads

FROM dev as ci

RUN npm install --save-dev typescript tslint ts-jest typeorm ts-node jest ts-jest nodemon prisma

COPY . .

FROM base as builder

RUN npm install -g typescript tslint

COPY . .

RUN npm install

RUN npm run build

FROM base as prod

RUN npm install -g prisma

COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=builder /usr/src/app/api-docs /usr/src/app/api-docs

RUN mkdir -p dist/uploads

CMD ["npm", "run", "start"]

