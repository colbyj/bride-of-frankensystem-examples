import os
from BOFS.create_app import create_app

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
app = create_app(path, 'minimal.cfg')

if __name__ == '__main__':
    app.debug = True
    app.run()
