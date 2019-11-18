def create(db):
    class MyTable(db.Model):
        __tablename__ = "led_button_log"
        ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
        participantID = db.Column(db.Integer, db.ForeignKey('participant.participantID'))
        answeredOn = db.Column(db.DateTime, nullable=False, default=db.func.now())
        answer = db.Column(db.String)

    return MyTable
