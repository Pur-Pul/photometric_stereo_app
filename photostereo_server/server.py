from flask import Flask, request
from normal_map import generate_normal_map

app = Flask(__name__)

@app.post("/normal_map/<string:map_id>")
def normal_map_post(map_id):
    print(map_id)
    format = request.get_json()["format"]
    generate_normal_map(map_id, '.'+format)
    return f'{map_id}'
