FROM node:22

WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm ci
USER node
run mkdir -m 666 ../output
CMD npm start