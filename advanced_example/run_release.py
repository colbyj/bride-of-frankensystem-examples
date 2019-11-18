# This is the run script you would execute when deploying the experiment publicly
import os
from BOFS.create_app import create_app

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
app = create_app(path, 'advanced.cfg')

if __name__ == '__main__':
    app.debug = False
    app.run('0.0.0.0', port=80)
