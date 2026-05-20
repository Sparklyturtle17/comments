import flask
from flask import request, jsonify

app = Flask(__name__)

# List
@app.route('/comments', methods=['GET'])
def api_all():
    result = do_query('SELECT * FROM comments;')
    return jsonify(result)

# Create
@app.route('/add', methods=['POST'])
def create_record():
    pass

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404

app.run()