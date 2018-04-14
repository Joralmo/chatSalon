// Hecho por:
//     Jose Altamar
//     Rubén Carrascal
// Software para redes | chat usando socket 
'use strict';
var estudiantes = [];
var profesorEnv = {};
var estudianteEnv = {};
var estudianteActual = {};
var encuesta = {};
var fil, col, profesor, estudiante, imagen;
var socket;
var profesor;
var enviar, inputEnviar;
var preguntasEncu = [];
var respuestasEncu = [];
var cantRespuesta = [];
var resGrafica = [];
var escribiendo = false;
$(document).ready(function () {
    /* comunicacion */
    socket = io.connect('http://' + document.domain + ':' + location.port);
    $(".m-open").modalF();
    socket.on('nuevoEstudiante', function (nombre) {
        mensaje("El estudiante " + nombre + " inicio sesión");
    });
    socket.on('escribiendo', function (e) {
        if (e == "profesor") {
            if (estudianteActual.tipo != "profesor") {
                let span = $("#proEscribiendo")[0];
                span.innerHTML = "Escrib...";
                setTimeout(() => {
                    span.innerHTML = "";
                }, 3000);
            }
        } else {
            if (estudianteActual.nombre != e.nombre) {
                let span = $(`#${e.fila}${e.columna}`)[0];
                span.innerHTML = "Escrib...";
                setTimeout(() => {
                    span.innerHTML = "";
                }, 3000);
            }
        }
    });

    //Aquí es donde se dibuja el grafico
    socket.on('getEncuestaPro', function (data) {
        cantRespuesta = [];
        resGrafica = [];
        let contador = 0;
        for (let i = 0; i < data.length - 1; i++) {
            for (let respuesta of respuestasEncu) {
                if (data[i] == respuesta.respuesta) {
                    contador++;
                }
            }
            resGrafica.push(data[i]);
            cantRespuesta.push(contador);
            contador = 0;
        }
        var ctx = document.getElementById("myChart").getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: resGrafica,
                datasets: [{
                    label: "# de respuestas",
                    data: cantRespuesta,
                    backgroundColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(162, 162, 235, 1)',
                        'rgba(255,99,132,1)',
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 255, 132, 1)',
                        'rgba(162, 162, 235, 1)',
                        'rgba(162, 162, 235, 1)',
                        'rgba(255,255,132,1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    })
    socket.on('getRespuestas', function (data) {
        respuestasEncu = data;
        socket.emit('getEncuestaPro');
    });
    let chat = $(".chat");
    socket.on('getMensajes', function (mensajes) {
        if (mensajes[mensajes.length - 1].usuario == estudianteActual.nombre) {
            chat.append(`
                <div class="message">
                    <span class="usuarioNombre">
                        <div class="foto">
                            <img src="${estudianteActual.imagen}"/>
                        </div>
                        Yo
                    </span>
                    <span class="texto">
                        ${mensajes[mensajes.length - 1].mensaje}
                    </span>
                </div>
            `)
        } else {
            chat.append(`
                <div class="message">
                    <span class="usuarioNombre">
                        <div class="foto">
                            <img src="${mensajes[mensajes.length - 1].imagen}"/>
                        </div>
                        ${mensajes[mensajes.length - 1].usuario}
                    </span>
                    <span class="texto">
                        ${mensajes[mensajes.length - 1].mensaje}
                    </span>
                </div>
            `)
        }
        scrollAutomatico();
    });
    socket.on('verEncuesta', function (data) {
        if (data) {
            $(".m-body")[0].innerHTML = "";
            $(".m-body").append(`
                <h1>Resultados</h1>
                <canvas id="myChart" width="400" height="400"></canvas>
            `);
            socket.emit('getRespuestas');
        } else {
            $(".m-body")[0].innerHTML = "";
            $(".m-body").append(`
                <input id="pregunta" type="text" placeholder="Pregunta"><br>
                <div id="respuestas"></div><br>
                <input type="button" id="agregarRespuesta" value="Agregar Respuesta">
                <input class="m-close" type="button" id="guardarEncuesta" value="Crear Encuesta">
                <br>
            `);
            $("#agregarRespuesta").on('click', function (e) {
                e.preventDefault();
                let respuestas = $("#respuestas");
                respuestas.append(`
                <input type="text" placeholder="Respuesta">
            `)
            })
            $("#guardarEncuesta").on('click', function (e) {
                e.preventDefault();
                let respuestas = $("#respuestas")[0].children;
                let pregunta = $("#pregunta").val();
                let aRespuestas = [];
                for (let respuesta of respuestas) {
                    aRespuestas.push(respuesta.value);
                }
                aRespuestas.push(pregunta);
                socket.emit('nuevaEncuesta', aRespuestas);
                $(this).fadeOut();
                $("#pregunta").val('');
                $("#respuestas input").val('');
            })
        }
    });
    socket.on('getEncuesta', function (data) {
        $(".m-body")[0].innerHTML = "";
        $(".m-body").append(`
            <h1>¿${data[data.length - 1]}?</h1>
            <form id="encuestaResponder" name="res" action="">
            </form>
        `)
        for (let i = 0; i < data.length - 1; i++) {
            preguntasEncu.push(data[i]);
            $("#encuestaResponder").append(`
                <input type="radio" name="respuesta" value="${data[i]}">${data[i]}<br>
            `)
        }
        $("#encuestaResponder").append(`
            <br>
            <button id="resEncuesta" type="submit" class="btn red">Responder</button>
            <br>
            <br>
            <canvas id="myChart" width="400" height="400"></canvas>
        `)
        socket.emit('getRespuestas');
    })
    socket.on('desconectado', function (nombre) {
        mensaje("El estudiante " + nombre + " cerro sesión")
    })
    /* comunicacion */
    $(".m-body").on('click', "#resEncuesta", function (e) {
        e.preventDefault();
        let enviar = {};
        enviar.respuesta = verRespuesta(document.res.respuesta);
        enviar.usuario = estudianteActual.nombre;
        socket.emit('respuesta', enviar);
    })
    $("#cerrarSesion").on('click', function (e) {
        e.preventDefault();
        socket.emit('cerrarSesion', estudianteActual);
        location.href = "/iniciarSesion";
        setTimeout(() => {
            socket.disconnect();
        }, 1000);
    })
    $('#iniciar').on('submit', function (e) {
        e.preventDefault();
        profesor = $("#profesor").val();
        fil = $("#fil").val();
        col = $("#col").val();
        profesorEnv.nombre = profesor;
        profesorEnv.fila = fil;
        profesorEnv.columna = col;
        var file = document.querySelector('input[type="file"]').files[0];
        if (file)
            getBase64(file);
        profesorEnv.tipo = "profesor";
        setTimeout(() => {
            profesorEnv.imagen = imagen;
            socket.emit('iniciarChat', profesorEnv);
            location.href = "/chat";
        }, 1000);
    });
    $('#iniciarSesion').on('submit', function (e) {
        e.preventDefault();
        estudiante = $("#estudiante").val();
        fil = $("#fil").val();
        col = $("#col").val();
        var file = document.querySelector('input[type="file"]').files[0];
        if (file)
            getBase64(file);
        estudianteEnv.nombre = estudiante;
        estudianteEnv.fila = fil;
        estudianteEnv.columna = col;
        estudianteEnv.tipo = "estudiante";
        setTimeout(() => {
            estudianteEnv.imagen = imagen;
            socket.emit('getProfesor');
        }, 1000);
        socket.on('getProfesor', function (data) {
            profesor = data[data.length - 1]
            if (fil >= profesor.fila || col >= profesor.columna) {
                mensaje("Filas o columnas no permitidas");
            } else {
                socket.emit('getEstudiantes');
                socket.on('getEstudiantes', function (data) {
                    if (JSON.stringify(data).length > 2) {
                        if(data.length>0){
                            parseData(data);
                        }
                    } else {
                        if(data.length>0){
                            parseData(data);
                        }
                    }
                    if (estudiantes.length > 0) {
                        let seguir = true;
                        for (let e of estudiantes) {
                            if (e.nombre == estudianteEnv.nombre || (e.fila == estudianteEnv.fila && e.columna == estudianteEnv.columna)) {
                                seguir = false;
                                break;
                            }
                        }
                        if (seguir) {
                            socket.emit('iniciarSesionEst', estudianteEnv);
                            getEstudiantes();
                            location.href = "/chat";
                        } else {
                            mensaje("El estudiante ya existe o la posición esta ocupada");
                        }
                    } else {
                        socket.emit('iniciarSesionEst', estudianteEnv);
                        location.href = "/chat";
                    }
                });
            }
        });
    });
    $("#encuesta").on('click', function (e) {
        e.preventDefault();
        if (estudianteActual.tipo == "profesor") {
            socket.emit('verEncuesta');
        } else {
            socket.emit('verEncuesta');
            socket.on('verEncuesta', function (data) {
                if (data) {
                    socket.emit('getEncuesta');
                } else {
                    $(".m-body")[0].innerHTML = "";
                    $(".m-body").append(`
                            <h3>No hay encuesta</h3>                            
                    `)
                }
            })
        }
    })
});

function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        imagen = reader.result;
    };
    reader.onerror = function (error) {
    };
}

function verRespuesta(form) {
    for (let i = 0; i < form.length; i++)
        if (form[i].checked) return form[i].value;
}

function mensaje(mensaje) {
    let x = $("#snackbar");
    x[0].innerHTML = mensaje;
    x.addClass("show");
    setTimeout(() => {
        x.removeClass("show");
    }, 3000);
}

function getMensajes() {
    socket.emit('getMensajes');
    socket.on('getMensajes', function (mensajes) {
    })
}

// Metodo utilizado para hacer scroll automamicamente al llegar un nuevo mensaje
function scrollAutomatico() {
    $('.chat').animate({
        scrollTop: $('.chat').get(0).scrollHeight
    }, 3000);
}


//funcion que se ejecuta al iniciar el chat para dibujar todo
function iniciar() {
    socket.emit('getUltimoEstudiante');
    socket.on('usuarioActual', function (data) {
        if (data[0].tipo) {
            estudianteActual = data[0];
        } else {
            estudianteActual = JSON.parse(data);
        }
    });
    getProfesor();
    getEstudiantes();
}

function parse(string, limpiar) {
    let res = string;
    while (res.includes(limpiar)) {
        res = res.replace(limpiar, "");
    }
    return res;
}

function parseData(data) {
    let split = JSON.stringify(data).split('","');
    let con = 0;
    for (let s of split) {
        s = parse(s, "\\n");
        s = parse(s, "\\");
        s = parse(s, " ");
        s = parse(s, "[");
        s = parse(s, "]");
        if (con == 0) {
            s = s.replace(s.substring(0, 1), "");
        }
        con++;
        if (con == split.length) {
            s = s.replace(/.$/, "");
        }
        estudiantes.push(JSON.parse(s));
    }
}

function getEstudiantes() {
    socket.emit('getEstudiantes');
    socket.on('getEstudiantes', function (data) {
        armarMatriz();
        if (data.length > 0) {
            parseData(data);
            // let split = JSON.stringify(data).split('","');
            // let con = 0;
            // for (let s of split) {
            //     s = parse(s, "\\n");
            //     s = parse(s, "\\");
            //     s = parse(s, " ");
            //     s = parse(s, "[");
            //     s = parse(s, "]");
            //     if (con == 0) {
            //         s = s.replace(s.substring(0, 1), "");
            //     }
            //     con++;
            //     if (con == split.length) {
            //         s = s.replace(/.$/, "");
            //     }
            //     estudiantes.push(JSON.parse(s));
            // }
        }

        for (let e of estudiantes) {
            let f = $(`#foto${e.fila}${e.columna}`);
            let span = $(`#nombre${e.fila}${e.columna}`);
            if (e.imagen)
                f.attr("src", e.imagen);
            span[0].innerHTML = e.nombre;
        }
    });
}

//Llena la matriz con los espacios que especifico el profesor
function armarMatriz() {
    let matrizU = $(".usuariosConectados");
    matrizU[0].innerHTML = "";
    for (let i = 0; i < profesor.fila; i++) {
        for (let j = 0; j < profesor.columna; j++) {
            matrizU.append(`
            <div class="usuario">
                <div class="usuairoContenido">
                    <div class="foto">
                        <img id="foto${i}${j}"/>
                    </div>
                    <span id='${i}${j}'></span>
                    <span id='nombre${i}${j}'>libre</span>
                </div>
            </div>
            `);
        }
        matrizU.append('<br>');
    }
    enviar = $("#enviar");
    inputEnviar = $("#mensaje");
    enviar.on('click', function (e) {
        e.preventDefault();
        enviarMensaje();
    })
    inputEnviar.on('keyup', function (e) {
        if (e.keyCode == 13) {
            enviarMensaje();
        } else {
            let me = $("#mensaje").val();
            if (me.length > 0)
                if (estudianteActual.tipo == "profesor")
                    socket.emit('escribiendo', "profesor");
                else
                    socket.emit('escribiendo', estudianteActual);
        }
    });
}
function enviarMensaje() {
    let mensajeEnv = $("#mensaje");
    if (mensajeEnv.val()) {
        let m = {};
        m.mensaje = mensajeEnv.val();
        m.usuario = estudianteActual.nombre;
        m.imagen = estudianteActual.imagen;
        socket.emit('nuevoMensaje', m);
        mensajeEnv.val("");
    }
}

function getProfesor() {
    socket.emit('getProfesor');
    socket.on('getProfesor', function (data) {
        profesor = data[data.length - 1]
        $("#imgProfesor").attr("src", profesor.imagen);
        $("#profesor")[0].innerHTML = profesor.nombre;
        armarMatriz();
    });
}