FROM node:erbium

ENV AWS_ACCESS_KEY_ID XXKEY
ENV AWS_SECRET_ACCESS_KEY XXSECRET
ENV AWS_SESSION_TOKEN XXTOKEN

COPY . /src

WORKDIR /src/client

RUN npm install

RUN npm run build

WORKDIR /src/server

RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]