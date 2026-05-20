import os
from flask import Flask, request, jsonify, json

app = Flask(__name__)



# List
@app.route('/comments', methods=['GET'])
def api_all():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "static/data", "comments.json")
    data = json.load(open(json_url))
    return jsonify(data)

# Create
@app.route('/add', methods=['POST'])
def create_record():
    pass

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404

app.run()