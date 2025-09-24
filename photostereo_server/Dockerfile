FROM python:3.12.3
ARG PORT
ENV PORT $PORT

RUN groupadd -g 1000 nonroot && useradd --no-create-home -u 1000 -g 1000 nonroot

WORKDIR /usr/src/app
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
USER nonroot
CMD gunicorn -w 4 -b 0.0.0.0:$PORT 'server:app'

