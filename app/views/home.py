# -*- coding: utf-8 -*-
# Hecho por:
#     Jose Altamar
#     Rubén Carrascal
# Software para redes | chat usando socket 

from flask import render_template, request
from flask_socketio import emit, disconnect
from app import app, socketio
from .estudiante import Estudiante
import json

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/chat')
def chat():
	return render_template('chat.html')

@app.route('/iniciarSesion')
def iniciarSesion():
	return render_template('iniEstudiante.html')

estudiantes = []
profesor = []
mensajes = []
encuesta = []
respuestas = []

#Se encarga de esperar los usuarios
@socketio.on('connect')
def connect():
	print("usuario conectado")


@socketio.on('disconnect')
def disconnect():
	print("usuario desconectado")

#Se encarga de vigilar cuando un usuario se desconecta
@socketio.on('cerrarSesion')
def cerrarSesion(est):
	if est in estudiantes:
		estudiantes.remove(est)
	emit('desconectado',est['nombre'], broadcast=True)
	emit('getEstudiantes', estudiantes, broadcast=True)

#Esta es la funcion que se ejecuta cuando inicia el profesor
@socketio.on('iniciarChat')
def iniciarChat(profesorRe):
	profesor.append(profesorRe)

#Encargada de marcar el inicio de sesión de cada estudiante
@socketio.on('iniciarSesionEst')
def iniciarSesionEst(estudiante):
	try:
		est = Estudiante(estudiante['nombre'], estudiante['fila'], estudiante['columna'], estudiante['imagen'])
	except:
		est = Estudiante(estudiante['nombre'], estudiante['fila'], estudiante['columna'])
	if(profesor):
		emit('nuevoEstudiante', est.getNombre(), broadcast=True)
		estudiantes.append(est)

#Difunde los mensajes a todos los usuarios conectados
@socketio.on('nuevoMensaje')
def nuevoMensaje(mensaje):
	mensajes.append(mensaje)
	#envia de una
	emit('getMensajes', mensajes, broadcast=True)

#Creación de las encuestas desde el panel del profesor
@socketio.on('nuevaEncuesta')
def nuevaEncuesta(encuestaRec):
	encuesta.append(encuestaRec)

#Método utilizado para agregar una nueva respuesta de la encuesta
@socketio.on('respuesta')
def respuesta(respuestaRec):
	respuestas.append(respuestaRec)

#Método encargado de obtener todos los mensajes.
@socketio.on('getMensajes')
def getMensajes():
	emit('getMensajes', mensajes, broadcast=True)

#Método que carga las respuestas dadas por los estudiantes sobre una encuesta
@socketio.on('getRespuestas')
def getRespuestas():
	emit('getRespuestas', respuestas)

#Permite ver si existe una encuesta
@socketio.on('verEncuesta')
def verEncuesta():
	if(encuesta):
		emit('verEncuesta', True)
	else:
		emit('verEncuesta', False)

#Mostrar las encuestas a los estudiantes
@socketio.on('getEncuesta')
def getEncuesta():
	emit('getEncuesta', encuesta[len(encuesta)-1])

@socketio.on('getEncuestaPro')
def getEncuestaPro():
	if(encuesta):
		emit('getEncuestaPro', encuesta[len(encuesta)-1])
		#Metodo utilizado para recibir la encuesta y dibujar el grafico

@socketio.on('escribiendo')
def escribiendo(estudiante):
	emit('escribiendo', estudiante, broadcast=True)

@socketio.on('getProfesor')
def getProfesor():
	emit('getProfesor', profesor, broadcast=True)

@socketio.on('getEstudiantes')
def getEstudiantes():
	enviar = []
	for est in estudiantes:
		enviar.append(json.dumps(est.__dict__,sort_keys=True, indent=4))
	emit('getEstudiantes', enviar, broadcast=True)

@socketio.on('getUltimoEstudiante')
def getUltimoEstudiante():
	if(estudiantes):
		enviar = json.dumps(estudiantes[len(estudiantes)-1].__dict__,sort_keys=True, indent=4)
		emit('usuarioActual', enviar)
	else:
		emit('usuarioActual',profesor)