import datetime
from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db
from BOFS.admin.util import verify_admin

# The name of this variable must match the folder's name.
unity_example = Blueprint('unity_example', __name__,
                          static_url_path='/unity_example',
                          template_folder='templates',
                          static_folder='static')


def handle_game_post():
    log = db.GameLog()
    log.participantID = session['participantID']
    log.input = request.form['input']

    db.session.add(log)
    db.session.commit()
    return ""


@unity_example.route("/game_embed", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def game_embed():
    if request.method == 'POST':
        return handle_game_post()
    return render_template("game_embed.html")


@unity_example.route("/game_fullscreen", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def game_fullscreen():
    if request.method == 'POST':
        return handle_game_post()
    return render_template("game_fullscreen.html")


@unity_example.route("/game_custom", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
def game_custom():
    if request.method == 'POST':
        return handle_game_post()
    return render_template("game_custom.html")


@unity_example.route("/fetch_condition")
@verify_session_valid
def fetch_condition():
    return str(session['condition'])


