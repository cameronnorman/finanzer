FROM node:15.8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g typescript

RUN npm install

COPY tsconfig.json ./

COPY . .

RUN tsc --project ./

EXPOSE 3000

CMD ["node build/app.js"]
