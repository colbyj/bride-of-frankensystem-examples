def create(db):
    class GameLog(db.Model):
        __tablename__ = "game_log"
        gameLogID = db.Column(db.Integer, primary_key=True, autoincrement=True)
        participantID = db.Column(db.Integer, db.ForeignKey('participant.participantID'))
        input = db.Column(db.String)
        submittedOn = db.Column(db.DateTime, nullable=False, default=db.func.now())

    return GameLog
