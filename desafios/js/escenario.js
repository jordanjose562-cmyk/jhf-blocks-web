/* JHF Desafios - el escenario
   Un tablero de casilleros donde el robot se mueve de a un paso.
   Este archivo no sabe nada de bloques: solo guarda el estado del tablero
   y responde a ordenes sueltas. Asi se puede probar por separado. */

const DIRECCIONES = [
  { nombre: 'derecha',  dx:  1, dy:  0, angulo:   0 },
  { nombre: 'abajo',    dx:  0, dy:  1, angulo:  90 },
  { nombre: 'izquierda', dx: -1, dy:  0, angulo: 180 },
  { nombre: 'arriba',   dx:  0, dy: -1, angulo: 270 }
];

class Escenario {
  constructor(mapa) {
    this.cargar(mapa);
  }

  cargar(mapa) {
    this.mapa = mapa;
    this.ancho = mapa.ancho;
    this.alto = mapa.alto;

    this.robot = {
      x: mapa.robot.x,
      y: mapa.robot.y,
      direccion: mapa.robot.direccion || 0   // indice en DIRECCIONES
    };

    // Copio las listas para no tocar el mapa original: el desafio se reinicia
    this.paredes = (mapa.paredes || []).map(p => ({ ...p }));
    this.objetos = (mapa.objetos || []).map(o => ({ ...o, tomado: false }));
    this.meta = mapa.meta ? { ...mapa.meta } : null;

    this.mochila = [];
    this.pasos = 0;
    this.error = null;
    this.sucesos = [];   // lo que hay que dibujar, en orden
  }

  reiniciar() {
    this.cargar(this.mapa);
  }

  /* ---------- Preguntas sobre el tablero ---------- */

  hayPared(x, y) {
    if (x < 0 || y < 0 || x >= this.ancho || y >= this.alto) return true;
    return this.paredes.some(p => p.x === x && p.y === y);
  }

  objetoEn(x, y) {
    return this.objetos.find(o => o.x === x && o.y === y && !o.tomado) || null;
  }

  adelante() {
    const d = DIRECCIONES[this.robot.direccion];
    return { x: this.robot.x + d.dx, y: this.robot.y + d.dy };
  }

  puedeAvanzar() {
    const { x, y } = this.adelante();
    return !this.hayPared(x, y);
  }

  hayObjetoAca() {
    return this.objetoEn(this.robot.x, this.robot.y) !== null;
  }

  estaEnLaMeta() {
    return this.meta !== null &&
           this.robot.x === this.meta.x &&
           this.robot.y === this.meta.y;
  }

  /* ---------- Ordenes ---------- */

  anotar(tipo, datos) {
    this.sucesos.push({ tipo, ...datos });
  }

  avanzar() {
    this.pasos++;
    const { x, y } = this.adelante();

    if (this.hayPared(x, y)) {
      this.error = 'El robot se choco contra una pared';
      this.anotar('choque', { x: this.robot.x, y: this.robot.y });
      return false;
    }

    this.robot.x = x;
    this.robot.y = y;
    this.anotar('mover', { x, y });
    return true;
  }

  girar(sentido) {   // 1 derecha, -1 izquierda
    this.pasos++;
    this.robot.direccion = (this.robot.direccion + sentido + 4) % 4;
    this.anotar('girar', { direccion: this.robot.direccion });
    return true;
  }

  juntar() {
    this.pasos++;
    const objeto = this.objetoEn(this.robot.x, this.robot.y);

    if (!objeto) {
      this.error = 'Aca no hay nada para juntar';
      this.anotar('fallo', { x: this.robot.x, y: this.robot.y });
      return false;
    }

    objeto.tomado = true;
    this.mochila.push(objeto.clase || 'engranaje');
    this.anotar('juntar', { x: objeto.x, y: objeto.y, clase: objeto.clase });
    return true;
  }

  /* ---------- Si el desafio esta resuelto ---------- */

  resuelto() {
    if (this.error) return false;

    const objetivo = this.mapa.objetivo || {};

    if (objetivo.juntarTodo) {
      const faltan = this.objetos.some(o => !o.tomado);
      if (faltan) return false;
    }

    if (objetivo.llegarALaMeta && !this.estaEnLaMeta()) return false;

    if (objetivo.pasosMaximos && this.pasos > objetivo.pasosMaximos) return false;

    return true;
  }

  // Explica en palabras por que todavia no esta resuelto
  queFalta() {
    if (this.error) return this.error;

    const objetivo = this.mapa.objetivo || {};

    if (objetivo.juntarTodo) {
      const faltan = this.objetos.filter(o => !o.tomado).length;
      if (faltan === 1) return 'Falta juntar 1 engranaje';
      if (faltan > 1) return 'Faltan juntar ' + faltan + ' engranajes';
    }

    if (objetivo.llegarALaMeta && !this.estaEnLaMeta()) {
      return 'El robot no llego hasta la marca';
    }

    if (objetivo.pasosMaximos && this.pasos > objetivo.pasosMaximos) {
      return 'Se resolvio, pero en ' + this.pasos + ' pasos. ' +
             'Se puede en ' + objetivo.pasosMaximos + ' o menos.';
    }

    return null;
  }
}

if (typeof window !== 'undefined') {
  window.Escenario = Escenario;
  window.DIRECCIONES = DIRECCIONES;
}
if (typeof module !== 'undefined') {
  module.exports = { Escenario, DIRECCIONES };
}
