from flask import Flask, jsonify, request, send_file, g, abort, Response, render_template_string
from functools import wraps

from pathlib import Path
import copy

from lxml import html
from lxml.etree import tounicode
from flask_cors import CORS
import click

import json
import random
import datetime
import uuid
import pytz

import jinja2

user_emails = dict()
front_end_path = None
email_path = None
user_path = None
users = list()

app = Flask(__name__)
CORS(app)
logged_in = dict()



@app.before_request
def setup_data():
    auth = request.headers.get("Authorization")
    if auth is not None:
        session_id = auth.partition(" ")[-1]
        user = logged_in.get(session_id)
        if user is not None:
            g.user = user
            g.session_id = session_id
            g.emails = user_emails[user['id']]
            g.admin = user["username"] == "admin"


def require_auth(f):
    @wraps(f)
    def _auth(*args, **kwargs):
        if g.get("user") is None:
            abort(401)
        return f(*args, **kwargs)

    return _auth


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def catch_all(path):

    if front_end_path is None:
        return "API only"

    file_path:Path = front_end_path/path
    if file_path.exists():
        print(f"{str(file_path)} exists")
        return send_file(file_path,last_modified=datetime.datetime.now(),cache_timeout=-1)
    else:
        print(f"{str(file_path)} does not exists. Sending index.html")
        return send_file(front_end_path/"index.html",last_modified=datetime.datetime.now(),cache_timeout=-1)

@app.route('/assets/<path>')
def get_assets(path):
    if front_end_path is None:
        return "API only"
    file_path = front_end_path/"assets"/path
    return send_file(file_path,cache_timeout=-1)



@app.route('/api/email')
@require_auth
def get_emails():
    return jsonify(list(g.emails.values()))


def replace_images(id: str, email_body: str):
    doc = html.fromstring(email_body)
    for img in doc.xpath("//img"):
        img.attrib["src"] = f'{img.attrib["src"]}?id={id}'
    return tounicode(doc)


@app.route('/api/email/<id>')
@require_auth
def get_email_by_id(id):
    email = copy.deepcopy(g.emails[id])
    email["showurl"] = g.user.get("showurl", False)
    if email["body"] == "body.html":
        with open(email_path / f"{id}/body.html", mode="rt") as f:
            body = f.read()
        
        email_date = datetime.datetime.fromtimestamp(email["date"]/1000,tz=pytz.timezone("Australia/Adelaide"))
        print(email_date)
        dates = list()
        if "date_offsets" in email:
            offs = email["date_offsets"]
            for off in offs:
                d_ = email_date+datetime.timedelta(hours=off.get("hours",0),days=off.get("days",0),minutes=off.get("minutes",0))
                dates.append(d_)
        else:
            dates.append(email_date+datetime.timedelta(days=-1))
       

        body = render_template_string(body,dates=dates)
        email["body"] = replace_images(id, body)
        
    return jsonify(email)


@app.route('/api/email/<id>/read', methods=["POST"])
def set_as_read(id):
    e = g.emails[id]
    e["read"] = request.json["read"]
    return jsonify(e)


@app.route('/api/email/<id>', methods=["GET"])
def get_email(id):
    e = g.emails[id]
    return jsonify(e)


@app.route('/api/user/logout')
@require_auth
def logout():
    global logged_in
    global user_emails
    del logged_in[g.session_id]
    del user_emails[g.user['id']]
    return {"status":"success"}

@app.route('/api/user/authenticate', methods=["POST"])
def authenticate():
    login_data = request.get_json()
    user = None
    for u in users:
        if u["username"] == login_data["username"] and u[
                "password"] == login_data["password"]:
            user = u
            break

    if user is not None:
        session_id = str(uuid.uuid4())

        for s,u_ in logged_in.items():
            if u_["username"] ==user["username"]:
                del logged_in[s]
                break

        logged_in[session_id] = user
        load_emails(user)
        usr = copy.deepcopy(user)
        del usr["password"]
        del usr["selection"]
        usr["session_id"] = session_id
        return jsonify({"status": "success", "user": usr})
    else:
        return jsonify({
            "status": "fail",
            "message": "Invalid user name or password"
        })


@app.route('/api/users/logged_in_users')
def get_logged_in_users():
    if g.admin:
        return jsonify(list(logged_in.values()))
    else:
        abort(403)


@app.route('/api/users')
def get_users():
    if g.admin:
        return jsonify(users)
    else:
        abort(403)


@app.route('/attachments/<path>')
def files(path):
    id = request.args.get('id')
    file_path = email_path / f"{id}/attachments/{path}"
    return send_file(file_path, cache_timeout=-1)


@app.route('/api/user/<id>/reload')
def reload(id):
    if not g.admin:
        abort(403)
        return
    user = None
    for u in users:
        if u["id"] == id:
            user = u
            break
    if user:
        load_emails(user)
        return "Done"
    else:
        return f"User not found: {id}"


@app.route('/api/user/<id>/showurl', methods=["POST"])
def showurl(id):
    if not g.admin:
        abort(403)
        return
    u = None
    for u_ in logged_in.values():
        if u_["id"] == id:
            u = u_
            break

    if u is None:
        abort(400)
        abort(Response("User not found"))
        return

    data_ = request.get_json()
    if data_ is None:
        abort(400)
        abort(Response("No data"))
        return

    u["showurl"] = data_.get("showurl", False)
    return jsonify(u)


def load_users():
    global users
    for f in user_path.glob("*.json"):
        uid = f.name[:-5]
        with open(f) as uf:
            u = json.load(uf)
            u["id"] = uid
            users.append(u)

    print(f"Loaded {len(users)} user(s)")


def load_emails(user):
    global user_emails
    selected_emails = dict()

    # Set time
    start_time = datetime.datetime.combine(
        datetime.date.today(), datetime.datetime.min.time(
        )) + datetime.timedelta(hours=4) * (random.random() - 0.5)
    P = len(user["selection"])
    N = datetime.datetime.now() - start_time
    partition = [0] * (P)
    partition[0] = datetime.timedelta(hours=0)
    partition[P - 1] = N

    for i in range(P - 1):
        partition[i] = random.random() * N
    partition = sorted(partition)

    time_offsets = [partition[i + 1] - partition[i] for i in range(P - 1)]

    times = [start_time]
    for i in range(len(time_offsets)):
        times.append(times[-1] + time_offsets[i])

    times = times[::-1]

    for i, id in enumerate(user["selection"]):
        id = id.strip()
        # selected_emails.append(id)
        data_file = email_path / id / "data.json"
        with open(data_file, mode="rt", encoding="utf-8") as f_:
            eml = json.load(f_)
            eml["id"] = id
            eml["read"] = False
            eml["date"] = round(times[i].timestamp() * 1000)
            selected_emails[id] = eml

    user_emails[user["id"]] = selected_emails


@click.command()
@click.option("-e", "--emails", "email_dir", default=None, required=True)
@click.option("-f", "--front_end", "frontend_dir", default=None)
@click.option("-u", "--users", "user_dir", default=None, required=True)
@click.option("-p", "--port", "port", default=8080)
def cli(email_dir, frontend_dir, user_dir, port):
    global front_end_path
    global email_path
    global user_path

    print(f"Email dir: {email_dir}")
    print(f"Front end dir: {frontend_dir}")
    print(f"User dir: {user_dir}")

    user_path = Path(user_dir).resolve()
    email_path = Path(email_dir).resolve()

    if frontend_dir is not None:
        front_end_path = Path(frontend_dir).resolve()

    load_users()
    app.run(host="0.0.0.0", port=port)
   
