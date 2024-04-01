from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db

# The name of this variable must match the folder's name.
my_task = Blueprint('my_task', __name__,
                    static_url_path='/my_task',
                    template_folder='templates',
                    static_folder='static')


@verify_correct_page
@verify_session_valid
@my_task.route('/task')
def route_my_task():
    return render_template("my_task.html")