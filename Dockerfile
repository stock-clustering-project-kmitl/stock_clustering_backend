FROM node:18-alpine 

WORKDIR /app

COPY package*.json ./

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

CMD [ "node", "./dist/src/main.js" ]

EXPOSE 3000