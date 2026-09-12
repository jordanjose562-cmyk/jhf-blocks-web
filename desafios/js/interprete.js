/* JHF Desafios - el interprete
   Recorre los bloques de a uno y le va dando ordenes al escenario. No genera
   codigo de texto: camina el arbol de bloques directamente, asi puede parar
   en cada paso, resaltar el bloque que se esta ejecutando, e ir despacio.

   Esa pausa es lo que hace que el chico entienda: ve el bloque encendido y
   el robot moverse al mismo tiempo. */

const LIMITE_PASOS = 2000;   // corta los programas que se cuelgan

class Interprete {
  constructor(espacio, escenario) {
    this.espacio = espacio;
    this.escenario = escenario;
    this.corriendo = false;
    this.detenido = false;
    this.pausado = false;
    this.pasosDados = 0;
    this.bloqueActual = null;
    this.seguirUnPaso = null;   // se completa cuando el chico toca "un paso"

    // Cada bloque que el chico escribio, en el orden en que se ejecuto.
    // Sirve para mostrar cuantas ordenes uso de verdad.
    this.ordenesUsadas = 0;

    // Los avisa el que maneja la pantalla
    this.alEjecutarBloque = null;   // (bloque) => ...
    this.alTerminarPaso = null;     // () => promesa que dura lo que dura la animacion
  }

  /* ---------- Arranque ---------- */

  async correr() {
    if (this.corriendo) return;

    this.corriendo = true;
    this.detenido = false;
    this.pasosDados = 0;
    this.ordenesUsadas = 0;
    this.escenario.reiniciar();

    const principal = this.espacio.getBlocksByType('desafio_programa', false)[0];
    const primero = principal ? principal.getInputTargetBlock('HACER') : null;

    try {
      await this.correrSecuencia(primero);
    } catch (error) {
      // Frenar a mano no es un error de verdad
      if (error.message !== 'detenido') throw error;
    }

    this.resaltar(null);
    this.corriendo = false;

    return {
      resuelto: this.escenario.resuelto(),
      queFalta: this.escenario.queFalta(),
      detenido: this.detenido,
      error: this.escenario.error
    };
  }

  detener() {
    this.detenido = true;
    this.despausar();
  }

  // Modo paso a paso: frena antes de cada bloque hasta que el chico avance
  pausar() {
    this.pausado = true;
  }

  despausar() {
    this.pausado = false;
    if (this.seguirUnPaso) {
      const seguir = this.seguirUnPaso;
      this.seguirUnPaso = null;
      seguir();
    }
  }

  // Deja correr un bloque y vuelve a frenar
  darUnPaso() {
    if (this.seguirUnPaso) {
      const seguir = this.seguirUnPaso;
      this.seguirUnPaso = null;
      seguir();
    }
  }

  esperarSiEstaPausado() {
    if (!this.pausado) return Promise.resolve();
    return new Promise((seguir) => { this.seguirUnPaso = seguir; });
  }

  /* ---------- Recorrido de los bloques ---------- */

  async correrSecuencia(bloque) {
    while (bloque) {
      await this.correrBloque(bloque);
      bloque = bloque.getNextBlock();
    }
  }

  async correrBloque(bloque) {
    this.controlarLimites();
    if (bloque.isEnabled && !bloque.isEnabled()) return;

    this.resaltar(bloque);
    await this.esperarSiEstaPausado();

    switch (bloque.type) {

      case 'desafio_avanzar':
        this.ordenesUsadas++;
        this.escenario.avanzar();
        await this.esperarPaso();
        this.cortarSiHayError();
        break;

      case 'desafio_girar':
        this.ordenesUsadas++;
        this.escenario.girar(bloque.getFieldValue('LADO') === 'DERECHA' ? 1 : -1);
        await this.esperarPaso();
        break;

      case 'desafio_juntar':
        this.ordenesUsadas++;
        this.escenario.juntar();
        await this.esperarPaso();
        this.cortarSiHayError();
        break;

      case 'desafio_repetir': {
        const veces = Number(bloque.getFieldValue('VECES')) || 0;
        const adentro = bloque.getInputTargetBlock('HACER');
        for (let i = 0; i < veces; i++) {
          this.controlarLimites();
          await this.correrSecuencia(adentro);
          this.resaltar(bloque);
        }
        break;
      }

      case 'desafio_hasta_llegar': {
        const adentro = bloque.getInputTargetBlock('HACER');
        while (!this.escenario.estaEnLaMeta()) {
          this.controlarLimites();
          await this.correrSecuencia(adentro);
          this.resaltar(bloque);
          if (this.escenario.error) break;
        }
        break;
      }

      case 'desafio_si': {
        if (this.evaluar(bloque.getInputTargetBlock('CONDICION'))) {
          await this.correrSecuencia(bloque.getInputTargetBlock('HACER'));
        }
        break;
      }

      case 'desafio_si_sino': {
        const rama = this.evaluar(bloque.getInputTargetBlock('CONDICION')) ? 'HACER' : 'SINO';
        await this.correrSecuencia(bloque.getInputTargetBlock(rama));
        break;
      }

      default:
        // Un bloque que no conozco no hace nada, pero tampoco rompe
        break;
    }
  }

  // Las preguntas se responden al momento, sin animacion
  evaluar(bloque) {
    if (!bloque) return false;

    switch (bloque.type) {
      case 'desafio_puede_avanzar': return this.escenario.puedeAvanzar();
      case 'desafio_hay_engranaje': return this.escenario.hayObjetoAca();
      case 'desafio_en_la_marca':   return this.escenario.estaEnLaMeta();
      default: return false;
    }
  }

  /* ---------- Frenos ---------- */

  controlarLimites() {
    if (this.detenido) throw new Error('detenido');

    this.pasosDados++;
    if (this.pasosDados > LIMITE_PASOS) {
      this.escenario.error = 'El programa no termina nunca. Fijate si le falta ' +
                             'una condicion para cortar el repetir.';
      throw new Error('detenido');
    }
  }

  cortarSiHayError() {
    if (this.escenario.error) throw new Error('detenido');
  }

  resaltar(bloque) {
    this.bloqueActual = bloque;
    if (this.alEjecutarBloque) this.alEjecutarBloque(bloque);
  }

  async esperarPaso() {
    if (this.alTerminarPaso) await this.alTerminarPaso();
  }
}

if (typeof window !== 'undefined') window.Interprete = Interprete;
if (typeof module !== 'undefined') module.exports = { Interprete, LIMITE_PASOS };
