# -*- coding: utf-8 -*-
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

from app.views import home


# Hecho por:
#     Jose Altamar
#     Rubén Carrascal
# Software para redes | chat usando socket 