# -*- coding: utf-8 -*-
from app import app, socketio

if __name__ == '__main__':
    socketio.run(app, host="localhost", port=7000)

# Hecho por:
#     Jose Altamar
#     Rubén Carrascal
# Software para redes | chat usando socket 