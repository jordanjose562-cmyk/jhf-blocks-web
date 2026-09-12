/* JHF Desafios - arranque y union de las partes */

let espacio;          // el espacio de bloques
let escenario;        // el estado del tablero
let tablero;          // el dibujo
let interprete;
let desafioActual = 0;
let velocidad = 380;  // milisegundos por paso
let resueltos = {};

/* ---------- Arranque ---------- */

function iniciar() {
  espacio = Blockly.inject('espacioTrabajo', {
    toolbox: { kind: 'flyoutToolbox', contents: [] },
    grid: { spacing: 24, length: 3, colour: '#CFDDD3', snap: true },
    zoom: { controls: true, wheel: true, pinch: true, startScale: 0.95, minScale: 0.4, maxScale: 2 },
    trashcan: true,
    move: { scrollbars: true, drag: true, wheel: true },
    renderer: 'zelos'
  });

  cargarProgreso();
  conectarBotones();
  cargarDesafio(primerSinResolver());

  window.addEventListener('resize', () => {
    Blockly.svgResize(espacio);
    if (tablero) { tablero.medir(); tablero.dibujar(); }
  });
}

function primerSinResolver() {
  const i = window.DESAFIOS.findIndex(d => !resueltos[d.id]);
  return i === -1 ? 0 : i;
}

/* ---------- Cargar un desafio ---------- */

function cargarDesafio(indice) {
  desafioActual = Math.max(0, Math.min(indice, window.DESAFIOS.length - 1));
  const d = window.DESAFIOS[desafioActual];

  document.getElementById('desafioGrupo').textContent = d.grupo;
  document.getElementById('desafioNombre').textContent = d.nombre;
  document.getElementById('consignaTexto').textContent = d.consigna;

  const ayuda = document.getElementById('ayudaTexto');
  ayuda.textContent = d.ayuda || '';
  ayuda.classList.remove('visible');

  // Solo los bloques que este desafio necesita
  espacio.updateToolbox({
    kind: 'flyoutToolbox',
    contents: d.bloques.map(tipo => ({ kind: 'block', type: tipo }))
  });

  espacio.clear();
  Blockly.serialization.workspaces.load({
    blocks: { languageVersion: 0, blocks: [{ type: 'desafio_programa', x: 40, y: 30 }] }
  }, espacio);

  escenario = new Escenario(d.mapa);
  tablero = new Tablero(document.getElementById('tablero'), escenario);
  tablero.dibujar();

  interprete = new Interprete(espacio, escenario);
  interprete.alEjecutarBloque = resaltarBloque;
  interprete.alTerminarPaso = animarPaso;

  ocultarCartel();
  actualizarFlechas();
}

function actualizarFlechas() {
  document.getElementById('btnAnterior').disabled = desafioActual === 0;
  document.getElementById('btnSiguiente').disabled = desafioActual === window.DESAFIOS.length - 1;
}

/* ---------- Ejecutar ---------- */

async function ejecutar(pasoAPaso) {
  const boton = document.getElementById('btnEjecutar');
  const botonPaso = document.getElementById('btnPaso');

  // Si ya esta corriendo, el boton de arriba frena
  if (interprete.corriendo && !pasoAPaso) {
    interprete.detener();
    return;
  }

  // Y si ya esta corriendo en modo paso, este boton avanza uno
  if (interprete.corriendo && pasoAPaso) {
    interprete.darUnPaso();
    return;
  }

  ocultarCartel();
  boton.textContent = 'Parar';
  boton.classList.add('parando');
  document.getElementById('btnReiniciar').disabled = true;

  if (pasoAPaso) {
    interprete.pausar();
    botonPaso.textContent = 'Siguiente';
    // El primer bloque tiene que correr sin esperar otro toque
    setTimeout(() => interprete.darUnPaso(), 0);
  }

  const resultado = await interprete.correr();

  boton.textContent = 'Ejecutar';
  boton.classList.remove('parando');
  botonPaso.textContent = 'Un paso';
  interprete.pausado = false;
  document.getElementById('btnReiniciar').disabled = false;
  resaltarBloque(null);

  if (resultado.detenido && !escenario.error) return;

  if (resultado.resuelto) {
    const eraNuevo = !resueltos[window.DESAFIOS[desafioActual].id];
    marcarResuelto();

    let texto = '¡Muy bien! Lo resolviste con ' + interprete.ordenesUsadas + ' ordenes.';
    const tope = (window.DESAFIOS[desafioActual].mapa.objetivo || {}).pasosMaximos;
    if (tope) texto += ' El desafio pedia ' + tope + ' o menos.';
    if (eraNuevo && desafioActual < window.DESAFIOS.length - 1) {
      texto += ' Toca la flecha para seguir.';
    }
    mostrarCartel('bien', texto);
  } else {
    mostrarCartel('falta', resultado.queFalta || 'Todavia no. Proba de nuevo.');
  }
}

function reiniciar() {
  if (interprete.corriendo) return;
  escenario.reiniciar();
  tablero.robotDibujado = {
    x: escenario.robot.x,
    y: escenario.robot.y,
    angulo: DIRECCIONES[escenario.robot.direccion].angulo
  };
  tablero.brillo = null;
  tablero.dibujar();
  ocultarCartel();
}

/* ---------- Animacion ---------- */

// El interprete espera esta promesa antes de seguir con el bloque siguiente,
// asi el dibujo va al mismo ritmo que la ejecucion.
function animarPaso() {
  const suceso = escenario.sucesos[escenario.sucesos.length - 1];
  if (!suceso) return Promise.resolve();

  if (suceso.tipo === 'mover') return moverRobot(suceso.x, suceso.y);
  if (suceso.tipo === 'girar') return girarRobot(suceso.direccion);
  if (suceso.tipo === 'juntar') return juntarConBrillo(suceso.x, suceso.y);
  if (suceso.tipo === 'choque' || suceso.tipo === 'fallo') return sacudir();

  return Promise.resolve();
}

function animar(duracion, alAvanzar) {
  return new Promise((listo) => {
    const arranque = performance.now();
    function paso(ahora) {
      const t = Math.min(1, (ahora - arranque) / duracion);
      alAvanzar(t < 1 ? suavizar(t) : 1);
      tablero.dibujar();
      if (t < 1) requestAnimationFrame(paso);
      else listo();
    }
    requestAnimationFrame(paso);
  });
}

// Arranca y termina despacio: se ve mucho mejor que a velocidad pareja
function suavizar(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function moverRobot(x, y) {
  const desdeX = tablero.robotDibujado.x;
  const desdeY = tablero.robotDibujado.y;
  return animar(velocidad, (t) => {
    tablero.robotDibujado.x = desdeX + (x - desdeX) * t;
    tablero.robotDibujado.y = desdeY + (y - desdeY) * t;
  });
}

function girarRobot(direccion) {
  const desde = tablero.robotDibujado.angulo;
  let hasta = DIRECCIONES[direccion].angulo;

  // Que gire por el lado corto y no dando la vuelta entera
  while (hasta - desde > 180) hasta -= 360;
  while (hasta - desde < -180) hasta += 360;

  return animar(velocidad * 0.8, (t) => {
    tablero.robotDibujado.angulo = desde + (hasta - desde) * t;
  });
}

function juntarConBrillo(x, y) {
  tablero.brillo = { x, y, fuerza: 1 };
  return animar(velocidad * 0.9, (t) => {
    tablero.brillo.fuerza = 1 - t;
  }).then(() => { tablero.brillo = null; tablero.dibujar(); });
}

function sacudir() {
  return animar(velocidad * 0.7, (t) => {
    tablero.sacudida = (1 - t) * 7;
  }).then(() => { tablero.sacudida = 0; tablero.dibujar(); });
}

/* ---------- Resaltado del bloque ---------- */

let bloqueMarcado = null;

function resaltarBloque(bloque) {
  if (bloqueMarcado && bloqueMarcado.workspace) {
    try { bloqueMarcado.removeSelect(); } catch (error) { /* ya no existe */ }
  }
  bloqueMarcado = bloque;
  if (bloque) {
    try { bloque.addSelect(); } catch (error) { /* ya no existe */ }
  }
}

/* ---------- Carteles ---------- */

function mostrarCartel(tipo, texto) {
  const cartel = document.getElementById('cartel');
  cartel.className = 'cartel ' + tipo + ' visible';
  cartel.textContent = texto;
}

function ocultarCartel() {
  document.getElementById('cartel').classList.remove('visible');
}

/* ---------- Progreso ---------- */

function marcarResuelto() {
  resueltos[window.DESAFIOS[desafioActual].id] = true;
  guardarProgreso();
}

// En Electron y en el navegador se guarda distinto, asi que pruebo los dos
function guardarProgreso() {
  try {
    window.localStorage.setItem('jhf-desafios-resueltos', JSON.stringify(resueltos));
  } catch (error) {
    // Sin lugar donde guardar, el progreso dura lo que dure la sesion
  }
}

function cargarProgreso() {
  try {
    const guardado = window.localStorage.getItem('jhf-desafios-resueltos');
    resueltos = guardado ? JSON.parse(guardado) : {};
  } catch (error) {
    resueltos = {};
  }
}

/* ---------- Lista de desafios ---------- */

function mostrarLista() {
  const caja = document.getElementById('listaContenido');
  caja.innerHTML = '';

  let grupo = null;
  window.DESAFIOS.forEach((d, i) => {
    if (d.grupo !== grupo) {
      grupo = d.grupo;
      const titulo = document.createElement('div');
      titulo.className = 'lista-grupo';
      titulo.textContent = grupo;
      caja.appendChild(titulo);
    }

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'lista-item' +
      (resueltos[d.id] ? ' resuelto' : '') +
      (i === desafioActual ? ' actual' : '');

    const tilde = document.createElement('span');
    tilde.className = 'lista-tilde';
    tilde.textContent = resueltos[d.id] ? '\u2713' : '';

    const nombre = document.createElement('span');
    nombre.textContent = d.nombre;

    boton.appendChild(tilde);
    boton.appendChild(nombre);
    boton.addEventListener('click', () => {
      document.getElementById('lista').close();
      cargarDesafio(i);
    });
    caja.appendChild(boton);
  });

  document.getElementById('lista').showModal();
}

/* ---------- Conexiones ---------- */

function conectarBotones() {
  document.getElementById('btnEjecutar').addEventListener('click', () => ejecutar(false));
  document.getElementById('btnPaso').addEventListener('click', () => ejecutar(true));
  document.getElementById('btnReiniciar').addEventListener('click', reiniciar);
  document.getElementById('btnLista').addEventListener('click', mostrarLista);
  document.getElementById('cerrarLista').addEventListener('click',
    () => document.getElementById('lista').close());

  document.getElementById('btnAnterior').addEventListener('click',
    () => { if (!interprete.corriendo) cargarDesafio(desafioActual - 1); });
  document.getElementById('btnSiguiente').addEventListener('click',
    () => { if (!interprete.corriendo) cargarDesafio(desafioActual + 1); });

  document.getElementById('btnAyuda').addEventListener('click',
    () => document.getElementById('ayudaTexto').classList.toggle('visible'));

  document.getElementById('selectorVelocidad').addEventListener('change', (evento) => {
    velocidad = Number(evento.target.value);
  });
}

window.addEventListener('load', iniciar);
