from flask import Blueprint, render_template

from BOFS.util import verify_correct_page

# The name of this variable must match the folder's name.
my_task = Blueprint('my_task', __name__,
                    static_url_path='/my_task',
                    template_folder='templates',
                    static_folder='static')


@my_task.route('/my_task_blueprint_route')
@verify_correct_page
def route_task():
    return render_template("my_task_blueprint_route.html")
