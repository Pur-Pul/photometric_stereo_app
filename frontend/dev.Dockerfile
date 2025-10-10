FROM node:22
ARG FRONT_PORT
ENV FRONT_PORT $FRONT_PORT
WORKDIR /usr/src/app

COPY package.json package-lock.json .eslintignore eslint.config.cjs ./
RUN npm install
COPY index.html vite.config.js testSetup.js ./

CMD npm run dev -- --port $FRONT_PORT --host
