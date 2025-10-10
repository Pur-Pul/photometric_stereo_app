FROM python:3.12.3
ARG PORT
ENV PORT $PORT

RUN groupadd -g 1000 nonroot && useradd --no-create-home -u 1000 -g 1000 nonroot

WORKDIR /usr/src/app
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY normal_map.py server.py ./
COPY photometric_stereo/photostereo_py/script/photostereo.py ./photometric_stereo/photostereo_py/script/photostereo.py
USER nonroot
CMD gunicorn -w 4 -b 0.0.0.0:$PORT 'server:app'

