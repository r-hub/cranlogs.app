FROM node:20-alpine

WORKDIR /src
COPY package*.json /
EXPOSE 80
ENV PORT=80

RUN npm install -g nodemon && npm install
COPY . .
RUN npm ci

CMD ["npm", "start"]
