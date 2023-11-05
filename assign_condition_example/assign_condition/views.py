assign_condition = Blueprint('assign_condition', __name__,
                         static_url_path='/assign_condition',
                         template_folder='templates',
                         static_folder='static')

@assign_condition.route("/custom_assign_condition")
@verify_session_valid
@verify_correct_page
def route_custom_assign_condition():
    p = db.session.query(db.Participant).get(session['participantID'])

    demographics = p.questionnaire("demographics_general")
    gender = demographics.device

    if gender == "Mouse":
        p.condition = 1
    elif gender == "Trackpad":
        p.condition = 2
    else:
        p.condition = 3

    db.session.commit()

    session['condition'] = p.condition

    return redirect("/redirect_from_page/custom_assign_condition")