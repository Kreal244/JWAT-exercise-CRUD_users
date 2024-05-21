FROM node:20-alpine

COPY . ./app

WORKDIR /app

RUN yarn
# Starting our application

CMD [ "yarn", "dev" ]

