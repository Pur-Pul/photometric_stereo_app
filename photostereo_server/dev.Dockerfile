FROM python:3.12.3
ARG PORT
ENV FLASK_RUN_PORT $PORT

WORKDIR /usr/src/app
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .

CMD flask --app server run --host=0.0.0.0 --debug
