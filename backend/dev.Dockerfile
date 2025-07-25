FROM node:22

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install

CMD ["npm", "run", "dev"] 