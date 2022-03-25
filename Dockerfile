FROM defradigital/node:latest

ARG REACH_UI_TYPE

USER root

ENV ENV_NAME $ENV_NAME

RUN mkdir -p /usr/src/app/logs
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm ci --only=production --fetch-retries 10 && \
    chown -R node /usr/src/app

USER node

EXPOSE 8001

CMD source /usr/src/app/start.sh
