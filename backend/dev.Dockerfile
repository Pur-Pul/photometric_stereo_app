FROM node:22
WORKDIR /usr/src/app
COPY package.json ./

RUN npm install
USER node
CMD npm run dev