"""
Custom database tables for the Unity example project.

BOFS calls ``create(db)`` at startup and registers any returned model classes
on the global ``db`` object, so they become accessible as ``db.GameLog`` (etc.)
from blueprint code.
"""


def create(db):
    class GameLog(db.Model):
        """One row per payload posted from the Unity build.

        Populated by ``handle_game_post`` in ``views.py``; each row records
        which participant submitted the data, the raw ``input`` field from the
        Unity ``WWWForm`` POST, and the server-side timestamp of receipt.
        """
        __tablename__ = "game_log"

        gameLogID = db.Column(db.Integer, primary_key=True, autoincrement=True)
        participantID = db.Column(db.Integer, db.ForeignKey('participant.participantID'))
        input = db.Column(db.String)
        submittedOn = db.Column(db.DateTime, nullable=False, default=db.func.now())

    return GameLog
