FROM node:22
ARG FRONT_PORT
ENV FRONT_PORT $FRONT_PORT
WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD npm run dev -- --port $FRONT_PORT --host
