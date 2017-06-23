var reproductor = document.getElementsByTagName('reproductor')[0];

var Lista = document.createElement('div');
var Agregar = document.createElement('label');
var AgregarInput = document.createElement('input');
var Buscar = document.createElement('div');
var Datos = document.createElement('div');
var Video = document.createElement('div');
var BarraTiempo = document.createElement('div');
var Bloqueo = document.createElement('div');
var canvas = document.createElement('canvas');
var EtiquetaVolumen = document.createElement('div');
var FormularioNuevoIngreso = document.createElement('div');

Datos.classList.add('datos');
FormularioNuevoIngreso.classList.add('formularioNuevoIngreso');
Lista.classList.add('lista');
Lista.classList.add('vacia');
Agregar.classList.add('agregar');
Buscar.classList.add('buscar');
Video.classList.add('video');
Video.setAttribute('id', 'video');
Bloqueo.classList.add('bloqueo');
EtiquetaVolumen.classList.add('etiquetaVolumen');
Buscar.innerHTML = "<div class='icono'><i class='fa fa-link fa-3x'  aria-hidden='true'></i></div>";
EtiquetaVolumen.innerHTML = "<div class='icono'><i class='fa fa-volume-up'  aria-hidden='true'></i></div>";
Bloqueo.innerHTML = "<div class='icono'><i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i><span class='sr-only'>Cargando...</span></div>";
BarraTiempo.classList.add('barraTiempo');

AgregarInput.setAttribute('accept', 'video/*,audio/*');
AgregarInput.setAttribute('multiple', 'true');
AgregarInput.setAttribute('type', 'file');
AgregarInput.setAttribute('hidden', 'true');

Agregar.innerHTML = "<i class='fa fa-plus fa-3x'></i><span class='sr-only'>Agregar Archivos</span>";

AgregarInput.addEventListener('change', agregarPorInput, false);
Agregar.addEventListener('dragover', handleDragOver, false);
Agregar.addEventListener('drop', handleFileSelect, false);
Agregar.appendChild(AgregarInput);
Datos.appendChild(Agregar);
Datos.appendChild(Buscar);
reproductor.appendChild(Lista);
reproductor.appendChild(Datos);
reproductor.appendChild(Video);
reproductor.appendChild(BarraTiempo);
Video.appendChild(canvas);

/*--- COLORES ----*/

var inputColor1 = document.createElement('input');
var inputColor2 = document.createElement('input');
var inputColorF = document.createElement('input');
var inputBarrasTam = document.createElement('input');

inputColor1.setAttribute('type', 'color');
inputColor2.setAttribute('type', 'color');
inputColorF.setAttribute('type', 'color');
inputBarrasTam.setAttribute('type', 'range');
inputBarrasTam.setAttribute('max', '6');
inputBarrasTam.setAttribute('min', '0');
inputBarrasTam.setAttribute('step', '1');
inputBarrasTam.setAttribute('value', '0');
inputBarrasTam.setAttribute('hidden', 'true');

inputColor1.addEventListener('change', function() {
    setTema(this.value, null, null);
    aplicarTema();
});
inputColor2.addEventListener('change', function() {
    setTema(null, this.value, null);
    aplicarTema();
});
inputColorF.addEventListener('change', function() {
    setTema(null, null, this.value);
    aplicarTema();
});

var TAMANIOBARRAS = 5;
var drawVisual;

inputBarrasTam.addEventListener('input', function() {
    TAMANIOBARRAS = 5 + parseInt(inputBarrasTam.value);
    localStorage.setItem('TAMANIOBARRAS', TAMANIOBARRAS);
    window.cancelAnimationFrame(drawVisual);
    visualizacion();
});

/*--- Formulario Busqueda ---*/
function verBusqueda() {
    bloquear(true);
    FormularioNuevoIngreso.style.transform = "translate(-50% , -50%)";
    FormularioNuevoIngreso.style.top = "50%";
}

function cerrarBusqueda() {
    FormularioNuevoIngreso.style.transform = "translate(-50% , -100%)";
    FormularioNuevoIngreso.style.top = "0";
    desbloquear();
}

var InputTextBusqueda = document.createElement('input');
var BtnCerrarBusqueda = document.createElement('div');
var AceptarBusqueda = document.createElement('div');
AceptarBusqueda.innerHTML = "Aceptar";
AceptarBusqueda.classList.add('aceptarBusqueda');
BtnCerrarBusqueda.classList.add('btnCerrarBusqueda');

Buscar.addEventListener('click', verBusqueda);
BtnCerrarBusqueda.addEventListener('click', cerrarBusqueda);

AceptarBusqueda.addEventListener('click', function() {
    if (!checkLink(InputTextBusqueda.value)) {
        InputTextBusqueda.value = "Link Invalido";
        return;
    }
    var o = getItemFromLink(InputTextBusqueda.value);
    o.type = checkType(o.type);
    if (!o.type) {
        InputTextBusqueda.value = "Archivo Invalido";
        return;
    }
    addData(o.name, o.url, o.type);
    Lista.appendChild(itemLista(o.name, o.type));
    cerrarBusqueda();
});

function checkLink(url) {
    var a = document.createElement('a');
    a.href = url;
    if (!a.host || a.host == window.location.host) return false;
    return true;
};

function checkType(tipo) {
    var vid = ["webm", "mp4"];
    var aud = ["ogg", "mp3", "wav"];
    if (vid.indexOf(tipo) > -1) {
        return "video/" + tipo;
    }
    if (aud.indexOf(tipo) > -1) {
        return "audio/" + tipo;
    }
    return false;
};

function getItemFromLink(link) {
    var o = new Object();
    o.url = link;
    var a = link.split('.');
    o.type = a[a.length - 1];
    var n = a[a.length - 2].split('/');
    o.name = n[n.length - 1];
    return o;
};


FormularioNuevoIngreso.appendChild(InputTextBusqueda);
FormularioNuevoIngreso.appendChild(BtnCerrarBusqueda);
FormularioNuevoIngreso.appendChild(AceptarBusqueda);

Datos.appendChild(inputColor1);
Datos.appendChild(inputColor2);
Datos.appendChild(inputColorF);
Datos.appendChild(inputBarrasTam);
document.body.appendChild(Bloqueo);
document.body.appendChild(EtiquetaVolumen);
document.body.appendChild(FormularioNuevoIngreso);

var AudioContext = window.AudioContext || window.webkitAudioContext;
var ctx = new AudioContext();
var analyser = ctx.createAnalyser();

var CT1 = "rgb(255,0,0)";
var CT2 = "black";
var BGN = "#e6e6e6";

function setTema(colorTema1, colorTema2, fondo) {
    if (colorTema1) {
        localStorage.setItem('colorTema1', colorTema1);
    }
    if (colorTema2) {
        localStorage.setItem('colorTema2', colorTema2);
    }
    if (fondo) {
        localStorage.setItem('fondo', fondo);
    }
    if (localStorage.getItem('colorTema1') == null) {
        localStorage.setItem('colorTema1', "rgb(255,0,0)");
    }
    if (localStorage.getItem('colorTema2') == null) {
        localStorage.setItem('colorTema2', "black");
    }
    if (localStorage.getItem('fondo') == null) {
        localStorage.setItem('fondo', "#e6e6e6");
    }
    if (localStorage.getItem('TAMANIOBARRAS') == null) {
        localStorage.setItem('TAMANIOBARRAS', "6");
    }

    CT1 = localStorage.getItem('colorTema1');
    CT2 = localStorage.getItem('colorTema2');
    BGN = localStorage.getItem('fondo');
    TAMANIOBARRAS = localStorage.getItem('TAMANIOBARRAS');
    inputBarrasTam.setAttribute('value', TAMANIOBARRAS - 5);
}

function aplicarTema() {
    setTema();
    document.body.style.backgroundColor = BGN;
    BarraTiempo.style.backgroundColor = CT1;
    BarraTiempo.style.color = CT1;
    Agregar.style.color = CT1;
    Buscar.style.color = CT1;
    EtiquetaVolumen.style.color = CT1;
    Bloqueo.style.color = CT2;
    FormularioNuevoIngreso.style.backgroundColor = BGN;
    AceptarBusqueda.style.color = CT2;
    AceptarBusqueda.style.backgroundColor = CT1;
    BtnCerrarBusqueda.style.color = CT2;
    Array.prototype.forEach.call(Lista.getElementsByTagName('div'), function(element, index, array) {
        if (!!element.getElementsByTagName('div')[0])
            element.getElementsByTagName('div')[0].style.color = CT2;
    });
}
aplicarTema();
inputColor1.setAttribute('value', CT1);
inputColor2.setAttribute('value', CT2);
inputColorF.setAttribute('value', BGN);

function bloquear(sinCarga) {
    if (sinCarga)
        Bloqueo.getElementsByTagName('div')[0].style.visibility = 'hidden';
    else
        Bloqueo.getElementsByTagName('div')[0].removeAttribute('style');
    Bloqueo.style.visibility = 'visible';
}

function desbloquear() {
    Bloqueo.style.visibility = 'hidden';
}

function ingresarURL() {

}

function agregarPorInput() {
    var files = AgregarInput.files;
    for (var i = 0, f; f = files[i]; i++) {
        comprobar(f);
        Lista.appendChild(itemLista(f.name, f.type));
    }
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    for (var i = 0, f; f = files[i]; i++) {
        comprobar(f);
        Lista.appendChild(itemLista(f.name, f.type));
    }
};

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
};

function comprobar(f) {
    var tipo = f.type;
    tipo = tipo.split('/')[0];
    if (tipo == "video") {
        guardarEnLista(f);
    } else if (tipo == "audio") {
        guardarEnLista(f);
    } else {
        console.error("El archivo no es un audio o video");
    }
};

function guardarEnLista(f) {
    var FR = new FileReader();
    FR.onload = function(e) {
        addData(f.name, e.target.result, f.type);
    };
    FR.readAsDataURL(f);
}

function mostrarLista(lista) {
    Lista.classList.add('vacia');
    Lista.innerHTML = "";
    for (var i = 0, f; f = lista[i]; i++) {
        Lista.className = 'lista';
        Lista.appendChild(itemLista(f.nombre, f.type));
    }
    desbloquear();
};

function itemLista(nombre, tipo) {
    var t = tipo;
    t = t.split('/')[0];
    var n = nombre;
    nombre = (nombre.length > 18) ? nombre.substring(0, 15) + "..." : nombre;
    var item = document.createElement('div');
    var iconBorrar = document.createElement('i');
    var icon = document.createElement('i');
    var etiqueta = document.createElement('div');
    etiqueta.addEventListener('click', function() {
        cargarMediaLocal(n);
    });
    iconBorrar.addEventListener('click', function() {
        borrarMediaLocal(n);
        iconBorrar.parentElement.parentElement.removeChild(iconBorrar.parentElement);
    });
    iconBorrar.classList.add('fa');
    iconBorrar.classList.add('fa-trash');
    iconBorrar.classList.add('borrarMediaLocal');
    iconBorrar.setAttribute('aria-hidden', true);
    icon.classList.add('fa');
    icon.setAttribute('aria-hidden', true);
    if (t == "video") {
        icon.classList.add('fa-video-camera');
    } else if (t == "audio") {
        icon.classList.add('fa-headphones');
    } else {
        etiqueta.removeEventListener('click', function() {
            cargarMediaLocal(n);
        });
    }
    icon.appendChild(document.createTextNode(' ' + nombre));
    etiqueta.appendChild(icon);
    etiqueta.style.color = CT2;
    item.appendChild(etiqueta);
    item.addEventListener('mouseover', function() {
        etiqueta.style.color = CT1;
    });
    item.addEventListener('mouseleave', function() {
        etiqueta.style.color = CT2;
    });
    item.insertBefore(iconBorrar, item.firstChild);
    return item;
};
var db;
var DBOpenRequest = window.indexedDB.open("Multimedia", 5);
DBOpenRequest.onerror = function(event) {
    console.log('Error loading database.');
};
DBOpenRequest.onsuccess = function(event) {
    console.log('Database initialised.');
    db = event.target.result;
    getVideos();
};
DBOpenRequest.onupgradeneeded = function(event) {
    var db = event.target.result;
    db.onerror = function(event) {
        console.log('Error loading database.');
    };
    var objectStore = db.createObjectStore("videos", {
        keyPath: "nombre"
    });
    objectStore.createIndex("video", "video", {
        unique: false
    });
    objectStore.createIndex("type", "type", {
        unique: false
    });
};

function addData(nombre, video, type) {
    var newItem = {
        nombre: nombre,
        video: video,
        type: type
    };
    var transaction = db.transaction(["videos"], "readwrite");
    transaction.oncomplete = function(event) {
        console.log('Transaction completed: database modification finished.');
    };
    transaction.onerror = function(event) {
        console.log('Transaction not opened due to error. Duplicate items not allowed.');
    };
    var objectStore = transaction.objectStore("videos");
    var objectStoreRequest = objectStore.put(newItem);
    objectStoreRequest.onsuccess = function(event) {
        console.log('New item added to database.');
        Lista.className = 'lista';
    };
};

function cargarMediaLocal(nombre) {
    bloquear();
    BarraTiempo.style.width = 0;
    var transaction = db.transaction(["videos"], "readwrite");
    transaction.oncomplete = function(event) {
        console.log('Transaction completed: database modification finished');
    };
    transaction.onerror = function(event) {
        console.log('Transaction not opened due to error: ', transaction.error);
    };
    var objectStore = transaction.objectStore("videos");
    var objectStoreRequest = objectStore.get(nombre);
    objectStoreRequest.onsuccess = function(event) {
        Video.innerHTML = "";
        Video.appendChild(canvas);
        Video.appendChild(crearMedia(objectStoreRequest.result));
        desbloquear();
    };
};

function borrarMediaLocal(nombre) {
    bloquear();
    var transaction = db.transaction(["videos"], "readwrite");
    transaction.oncomplete = function(event) {
        console.log('Transaction completed: database modification finished');
    };
    transaction.onerror = function(event) {
        console.log('Transaction not opened due to error: ', transaction.error);
    };
    var objectStore = transaction.objectStore("videos");
    var objectStoreRequest = objectStore.delete(nombre);
    objectStoreRequest.onsuccess = function(event) {
        console.log('item eliminado');
        desbloquear();
    };
};

function getVideos() {
    var transaction = db.transaction(["videos"], "readwrite");
    transaction.oncomplete = function(event) {
        console.log('Transaction completed: database modification finished');
    };
    transaction.onerror = function(event) {
        console.log('Transaction not opened due to error: ', transaction.error);
    };
    var objectStore = transaction.objectStore("videos");
    var objectStoreRequest = objectStore.getAll();
    objectStoreRequest.onsuccess = function(event) {
        mostrarLista(objectStoreRequest.result);
    };
}

/*---- Reproductor ----*/
function crearMedia(datos) {
    inputBarrasTam.setAttribute('hidden', 'true');
    canvas.style.display = 'none';
    var m = document.createElement('video');
    var t = datos.type;
    t = t.split('/')[0];
    if (t == "audio") {
        m = document.createElement('audio');
    }
    m.setAttribute('src', datos.video);
    //m.setAttribute('type', datos.type);
    m.setAttribute('autoplay', 'true');
    m.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        m.currentTime = (e.layerX * m.duration / m.offsetWidth);
    });
    m.addEventListener('click', function(e) {
        e.preventDefault();
        alternarPlay();
    });
    m.addEventListener('timeupdate', function() {
        var anchoLineaTiempo = (100 * m.currentTime / m.duration);
        BarraTiempo.style.width = anchoLineaTiempo + '%';
        var minutos = Math.floor(m.currentTime / 60);
        var segundos = Math.floor(m.currentTime - (minutos * 60));
        minitos = (minutos < 10) ? '0' + minutos : minutos;
        segundos = (segundos < 10) ? '0' + segundos : segundos;
        BarraTiempo.setAttribute('tiempo', minutos + ':' + segundos);
    });
    if (t == "audio") {
        m.addEventListener("canplaythrough", audio_canplaythrough);
        inputBarrasTam.removeAttribute('hidden');
        canvas.style.display = 'block';
    }
    m.volume = setVolumen();
    return m;
}

function audio_canplaythrough() {
    var source = ctx.createMediaElementSource(this);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    this.removeEventListener("canplaythrough", audio_canplaythrough);
}
/*---- AUDIO visualizacion ----

function visualizacion() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    canvasCtx = canvas.getContext('2d');
    analyser.fftSize = Math.pow(2, TAMANIOBARRAS);
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
        drawVisual = window.requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = BGN;
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        var barWidth = (WIDTH / bufferLength) + 1;
        var barHeight;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            var gradient = canvasCtx.createLinearGradient(0, 0, 0, HEIGHT);
            gradient.addColorStop("0", CT1);
            gradient.addColorStop("" + (barHeight / 256), CT1);
            gradient.addColorStop("1", CT2);
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, HEIGHT - (barHeight * HEIGHT / 256), barWidth, (barHeight * HEIGHT / 256));
            x += barWidth - 1;
        }
    };
    draw();
};
visualizacion();
*/
Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
var giro = 0;

function visualizacion() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    canvasCtx = canvas.getContext('2d');
    analyser.fftSize = Math.pow(2, TAMANIOBARRAS);
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
        drawVisual = window.requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.fillStyle = BGN;
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        var barWidth = (WIDTH / bufferLength) + 1;
        var barHeight;
        var x = 0;
        var maxGrados = 360,
            centro = 10,
            minBarra = 0,
            maxBarra = HEIGHT / 2 - (centro + 3);

        for (let i = 0; i <= maxGrados; i++) {
            if (bufferLength < 2) {
                window.cancelAnimationFrame(drawVisual);
                break;
            }
            var ii = i + giro;
            if (giro >= maxGrados) giro = 0;
            giro++;
            if (ii > maxGrados) ii -= maxGrados;
            var rad = (Math.PI / 180) * ii;
            var c = Math.cos(rad);
            var s = Math.sin(rad);
            var _i = parseInt(i.map(0, bufferLength, 0, maxGrados));
            barHeight = dataArray[_i];
            if (barHeight < 128)
                barHeight = barHeight.map(0, 160, minBarra, maxBarra);
            else
                barHeight = barHeight.map(0, 256, minBarra, maxBarra);

            var innerPointX = WIDTH / 2 + (centro * c);
            var innerPointY = HEIGHT / 2 + (centro * s);
            var outerPointX = WIDTH / 2 + (barHeight * c);
            var outerPointY = HEIGHT / 2 + (barHeight * s);

            var gradient = canvasCtx.createLinearGradient(innerPointX, innerPointY, outerPointX, outerPointY);
            gradient.addColorStop("0", CT1);
            gradient.addColorStop("" + (barHeight / 256), CT1);
            gradient.addColorStop("1", CT2);
            canvasCtx.beginPath();
            canvasCtx.lineJoin = "round";
            canvasCtx.moveTo(innerPointX, innerPointY);
            canvasCtx.lineTo(outerPointX, outerPointY);
            canvasCtx.strokeStyle = gradient;
            canvasCtx.stroke();
        }
    };
    draw();
};
visualizacion();
/*---Teclado---*/
document.addEventListener('keydown', function(e) {
    tecla = (document.all) ? e.keyCode : e.which;
    if (tecla == 40) { //abajo
        e.preventDefault();
        bajarVolumen();
    }
    if (tecla == 38) { //arriba
        e.preventDefault();
        subirVolumen();
    }
    if (tecla == 37) { //izquierda
        e.preventDefault();
        atrasarMedia();
    }
    if (tecla == 39) { //derecha
        e.preventDefault();
        adelantarMedia();
    }
    if (tecla == 70) { // f
        e.preventDefault();
        alternarScreen();
    }
    if (tecla == 32) { //espacio
        e.preventDefault();
        alternarPlay();
    }
});

function setVolumen(valorVolumen) {
    if (localStorage.getItem('volumen') == null) {
        localStorage.setItem('volumen', 1);
    }
    if (!valorVolumen) {
        return localStorage.getItem('volumen');
    }
    localStorage.setItem('volumen', valorVolumen);
}
EtiquetaVolumen.addEventListener('animationend', function() {
    EtiquetaVolumen.className = 'etiquetaVolumen';
});

function etiquetaVolumen(action, porcentaje) {
    if (!action) {
        EtiquetaVolumen.innerHTML = "<div class='icono'><i class='fa  fa-ban'  aria-hidden='true'></i></div>";
        EtiquetaVolumen.classList.add('mostrarVolumen');
        return;
    }
    if (porcentaje > .6)
        EtiquetaVolumen.innerHTML = "<div class='icono'>" + Math.floor(porcentaje * 10) + " <i class='fa fa-volume-up'  aria-hidden='true'></i</div>";
    else if (porcentaje > .1)
        EtiquetaVolumen.innerHTML = "<div class='icono'>" + Math.floor(porcentaje * 10) + " <i class='fa fa-volume-down'  aria-hidden='true'></i></div>";
    else
        EtiquetaVolumen.innerHTML = "<div class='icono'>" + Math.floor(porcentaje * 10) + " <i class='fa fa-volume-off'  aria-hidden='true'></i></div>";
    EtiquetaVolumen.classList.add('mostrarVolumen');
}

function volumenSinMedia() {
    etiquetaVolumen();
}

function bajarVolumen() {
    media = Video.getElementsByTagName('video')[0];
    if (!media)
        media = Video.getElementsByTagName('audio')[0];
    if (!media)
        return volumenSinMedia();
    if (media.volume >= 0.1) {
        media.volume = (media.volume - 0.1).toFixed(2);
        setVolumen(media.volume);
    }
    etiquetaVolumen('bajar', media.volume);
}

function subirVolumen() {
    media = Video.getElementsByTagName('video')[0];
    if (!media)
        media = Video.getElementsByTagName('audio')[0];
    if (!media)
        return volumenSinMedia();
    if (media.volume <= 0.9) {
        media.volume = (media.volume + 0.1).toFixed(2);
        setVolumen(media.volume);
    }
    etiquetaVolumen('subir', media.volume);
}

function atrasarMedia() {
    media = Video.getElementsByTagName('video')[0];
    if (!media)
        media = Video.getElementsByTagName('audio')[0];
    if (!media) return;
    if ((media.currentTime - 10) < 0) {
        media.currentTime -= (media.currentTime / 2);
    } else {
        media.currentTime -= 10;
    }
}

function adelantarMedia() {
    media = Video.getElementsByTagName('video')[0];
    if (!media)
        media = Video.getElementsByTagName('audio')[0];
    if (!media) return;
    if ((media.currentTime + 10) < media.duration) {
        media.currentTime += 10;
    } else {
        media.currentTime += ((media.duration - media.currentTime) / 2);
    }
}

function alternarPlay() {
    media = Video.getElementsByTagName('video')[0];
    if (!media)
        media = Video.getElementsByTagName('audio')[0];
    if (!media) return;
    if (media.paused) {
        media.play();
    } else {
        media.pause();
    }
}

function alternarScreen() {
    media = Video.getElementsByTagName('video')[0];
    if (!media) return;
    if ((' ' + Video.className + ' ').indexOf(' video ') > -1)
        Video.className = 'videoFull';
    else
        Video.className = 'video';
}
