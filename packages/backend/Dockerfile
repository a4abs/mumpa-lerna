FROM node:13.6.0

RUN npm cache clean --force

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json /app/package.json

RUN npm install --silent

COPY . .

EXPOSE 4000

CMD ["npm", "start"]