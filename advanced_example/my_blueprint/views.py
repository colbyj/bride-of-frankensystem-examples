from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db
from BOFS.admin.util import verify_admin

# The name of this variable must match the folder's name.
my_blueprint = Blueprint('my_blueprint', __name__,
                         static_url_path='/my_blueprint',
                         template_folder='templates',
                         static_folder='static')


@my_blueprint.route("/task", methods=['POST', 'GET'])
@verify_correct_page
@verify_session_valid
@page_tables('answers')
def task():
    incorrect = None

    if request.method == 'POST':
        log = db.answers()  # Defined in my_blueprint/tables/answers.json
        log.participantID = session['participantID']
        log.answer = request.form['answer']

        db.session.add(log)
        db.session.commit()

        if log.answer.lower() == "linux":
            return redirect("/redirect_next_page")
        incorrect = True

    return render_template("task.html", incorrect=incorrect)


@my_blueprint.route("/analysis")
@verify_admin
def analysis():
    results = db.session.query(
            db.Participant.participantID,
            db.func.count(db.answers.answersID).label('tries')
        ).\
        join(db.answers, db.answers.participantID == db.Participant.participantID).\
        filter(db.Participant.finished).\
        group_by(db.answers.participantID).\
        all()

    return render_template("analysis.html", results=results)
