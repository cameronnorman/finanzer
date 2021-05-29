FROM node:14.17-alpine as base

WORKDIR /usr/src/app

COPY package*.json ./

FROM base as dependencies

RUN npm install -g typescript tslint ts-jest typeorm ts-node jest nodemon prisma

RUN mkdir -p uploads

FROM dependencies as ci

COPY . .

RUN npm install

FROM base as builder

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

