from flask import Blueprint, render_template
from BOFS.util import verify_correct_page

# The Blueprint variable name must match the folder name.
jspsych_stroop = Blueprint('jspsych_stroop', __name__,
                           static_url_path='/jspsych_stroop',
                           template_folder='templates',
                           static_folder='static')


@jspsych_stroop.route('/jspsych_stroop')
@verify_correct_page
def stroop():
    return render_template('jspsych_stroop.html')
