FROM node:boron

MAINTAINER Bogdan Tirca <bogdantirca92@gmail.com>

RUN apt-get update

RUN apt-get install make

RUN apt-get install -y build-essential g++
RUN apt-get install -y libboost-dev

RUN npm install pm2 -g

RUN mkdir workspace

WORKDIR workspace

RUN mkdir server

COPY score-estimator /workspace/server/score-estimator
WORKDIR server/score-estimator
RUN make

WORKDIR ..

RUN mkdir temp_boards

COPY package.json /workspace/server/package.json
RUN npm install

COPY server.js /workspace/server/server.js

EXPOSE 3001
CMD [ "pm2-docker", "server.js", "-i 0" ]
