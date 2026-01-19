from flask import Flask, send_from_directory, abort
import os

app = Flask(__name__)
base_dir = os.path.dirname(__file__)


@app.route("/")
def index():
    return send_from_directory(base_dir, "index.html")


@app.route("/<path:filename>")
def serve_file(filename):
    file_path = os.path.join(base_dir, filename)
    if os.path.isfile(file_path):
        return send_from_directory(base_dir, filename)
    html_path = f"{filename}.html"
    if os.path.isfile(os.path.join(base_dir, html_path)):
        return send_from_directory(base_dir, html_path)
    abort(404)


if __name__ == "__main__":
    app.run(host="localhost", port=5001, debug=True)

