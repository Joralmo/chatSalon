## Instrucciones para su uso.

#### Prerequisitos:

1. Python 2.7.15
2. Google chrome recomendado (por el Filereader que se utiliza para manejar los avatar de los usuarios en formato base64)

El lado del servidor lo manejamos con Python y el lado del cliente con JavaScript.

### Para desplegar el proyecto debemos realizar los siguientes pasos:

Debemos entrar a la carpeta clonada del proyecto.

- Instalar un entorno virtual 
  ```python
  pip install virtualenv
  ```
  
- Crear un entorno virtual
  ```python
  virtualenv chat
  ```

- Activar entorno virtual
  ```python
  source chat/bin/activate
  ```

- Instalar las dependencias necesarias para poder ejecutar el proyecto
  ```python
  pip install -r requirements.txt
  ```

En el archivo `run.py` está especificado el host y el puerto donde vá a correr la aplicación.

Luego de configurado el archivo que por defecto tiene localhost y puerto 7000 corremos el comando `python run.py` y vamos al navegador en `http://localhost:7000`

Rutas posibles:

\- `http://localhost:7000/` -> ruta raiz en la cual se requiere el nombre del profesor y el tamaño de la matriz del curso (opcional la foto).

\- `http://localhost:7000/iniciarSesion` -> ruta para el inicio de sesión de los estudiantes (se requiere antes haber creado el chat por el profesor).

\- `http://localhost:7000/chat` -> ruta donde aterrizan ambos usuarios (profesor y alumno) despues de iniciar.

Los métodos tienen nombres nemotécnicos, algunos tienen comentarios.

Se puede enviar un mensaje pulsando enter o la tecla enviar.

En la parte de la encuesta en la pregunta no colocar signos de interogación u otros caracteres especiales (nos daba error al intentar hacerlo), se pueden agregar 1 o mas respuestas (mas de 2 recomendable, porque con 1 no se pinta bien el grafico), luego de creada se debe cerrar el modal y abrir de nuevo para ver las respuestas, se puede actualizar la gráfica cerrando y abriendo el modal; un estudiante solo podrá ver la encuesta luego de ser creada.

El boton flotante rojo de la izquierda es el cerrar sesión.



> Hecho por:
>
>     Jose Altamar
>
>     Rubén Carrascal
>
> Software para redes | Chat usando Socket 