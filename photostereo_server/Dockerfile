FROM python:3.12.3
ARG PORT
ENV PORT $PORT

WORKDIR /usr/src/app
COPY . .
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install -r requirements.txt
CMD gunicorn -w 4 -b 0.0.0.0:$PORT 'server:app'

