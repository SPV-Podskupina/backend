FROM node:23-alpine3.20

WORKDIR /app

COPY package*.json ./

COPY ./bin ./bin

COPY ./controllers ./controllers
COPY ./middleware ./middleware
COPY ./models ./models
COPY ./routes ./routes

COPY ./public ./public
COPY ./resources ./resources
COPY ./tests ./tests

COPY app.js ./
COPY swagger.js ./

ARG DB_URI
ARG JWT_KEY

ENV  DB_URI=$DB_URI
ENV  JWT_KEY=$JWT_KEY

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
