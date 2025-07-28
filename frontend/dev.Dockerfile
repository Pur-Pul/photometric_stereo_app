FROM node:22
ARG FRONT_PORT
ENV FRONT_PORT $FRONT_PORT
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install
COPY index.html ./

CMD npm run dev -- --port $FRONT_PORT --host
