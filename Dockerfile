FROM node:boron

MAINTAINER Bogdan Tirca <bogdantirca92@gmail.com>

RUN mkdir workspace

WORKDIR workspace

RUN mkdir score-estimator
COPY score-estimator /workspace/score-estimator

WORKDIR score-estimator

RUN apt-get update

RUN apt-get install make

RUN apt-get install -y build-essential g++
RUN apt-get install -y libboost-dev

RUN make

RUN ./estimator test_games/1776378.game
