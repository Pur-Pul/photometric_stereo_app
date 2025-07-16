from flask import Flask, request
import subprocess, os

BACKEND_URI = os.getenv("BACKEND_URI")
app = Flask(__name__)

@app.post("/normal_map/<string:map_id>")
def normal_map_post(map_id):
    print(map_id)
    format = request.get_json()["format"]
    
    subprocess.Popen([
        'python',
        f'{os.path.abspath(os.path.dirname(__file__))}/normal_map.py',
        f'{map_id}', f'.{format}',
        f'{BACKEND_URI}/images'
    ])
    return f'{map_id}'
