from flask import Flask, request
import subprocess, os
from normal_map import clear_upload

BACKEND_URI = os.getenv("BACKEND_URI")
app = Flask(__name__)


@app.post("/normal_map/<string:map_id>")
def normal_map_post(map_id):
    print(map_id)
    format = request.get_json()["format"]
    file_name = request.get_json()["file_name"]
    
    subprocess.Popen([
        'python',
        f'{os.path.abspath(os.path.dirname(__file__))}/normal_map.py',
        f'{map_id}', f'{file_name}', f'.{format}',
        f'{BACKEND_URI}/images'
    ])
    return f'{map_id}'
