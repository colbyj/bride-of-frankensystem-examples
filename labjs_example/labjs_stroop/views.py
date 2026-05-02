from flask import Blueprint, render_template
from BOFS.util import verify_correct_page

# The Blueprint variable name must match the folder name.
labjs_stroop = Blueprint('labjs_stroop', __name__,
                         static_url_path='/labjs_stroop',
                         template_folder='templates',
                         static_folder='static')


@labjs_stroop.route('/labjs_stroop')
@verify_correct_page
def stroop():
    return render_template('labjs_stroop.html')
