FROM python:3.12.3
ARG PORT
ARG UID=1000
ARG GID=1000

ENV PORT $PORT

RUN groupadd -g "${GID}" nonroot && useradd --no-create-home -u "${UID}" -g "${GID}" nonroot

WORKDIR /usr/src/app
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
USER nonroot
CMD gunicorn -w 4 -b 0.0.0.0:$PORT 'server:app'

