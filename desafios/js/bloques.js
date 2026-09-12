/* JHF Desafios - los bloques
   Son pocos a proposito. Cada desafio muestra solo los que necesita, asi el
   chico no elige entre veinte cosas cuando el problema se resuelve con tres. */

const COLOR_MOVER = '#1D4E8F';
const COLOR_ACCION = '#E67E22';
const COLOR_REPETIR = '#10893F';
const COLOR_PREGUNTAR = '#8E44AD';

Blockly.defineBlocksWithJsonArray([
  {
    type: 'desafio_programa',
    message0: 'Programa %1 %2',
    args0: [
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' }
    ],
    colour: '#123A22',
    tooltip: 'Todo lo que el robot va a hacer va adentro de este bloque.',
    deletable: false,
    movable: false
  },
  {
    type: 'desafio_avanzar',
    message0: 'avanzar',
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_MOVER,
    tooltip: 'Un casillero hacia donde esta mirando el robot.'
  },
  {
    type: 'desafio_girar',
    message0: 'girar a la %1',
    args0: [
      { type: 'field_dropdown', name: 'LADO', options: [['derecha', 'DERECHA'], ['izquierda', 'IZQUIERDA']] }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_MOVER,
    tooltip: 'El robot gira sin moverse del casillero.'
  },
  {
    type: 'desafio_juntar',
    message0: 'juntar el engranaje',
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_ACCION,
    tooltip: 'Solo funciona si el robot esta parado sobre un engranaje.'
  },
  {
    type: 'desafio_repetir',
    message0: 'repetir %1 veces %2 %3',
    args0: [
      { type: 'field_number', name: 'VECES', value: 3, min: 1, max: 50, precision: 1 },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_REPETIR,
    tooltip: 'Hace lo de adentro la cantidad de veces que le digas.'
  },
  {
    type: 'desafio_hasta_llegar',
    message0: 'repetir hasta llegar a la marca %1 %2',
    args0: [
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_REPETIR,
    tooltip: 'Repite hasta que el robot pise la marca del piso.'
  },
  {
    type: 'desafio_si',
    message0: 'si %1 %2 %3',
    args0: [
      { type: 'input_value', name: 'CONDICION', check: 'Boolean' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_REPETIR,
    tooltip: 'Hace lo de adentro solo si se cumple la pregunta.'
  },
  {
    type: 'desafio_si_sino',
    message0: 'si %1 %2 %3 si no %4 %5',
    args0: [
      { type: 'input_value', name: 'CONDICION', check: 'Boolean' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'SINO' }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: COLOR_REPETIR,
    tooltip: 'Elige entre dos caminos segun la pregunta.'
  },
  {
    type: 'desafio_puede_avanzar',
    message0: 'el camino esta libre',
    output: 'Boolean',
    colour: COLOR_PREGUNTAR,
    tooltip: 'Verdadero si no hay una pared justo adelante.'
  },
  {
    type: 'desafio_hay_engranaje',
    message0: 'hay un engranaje aca',
    output: 'Boolean',
    colour: COLOR_PREGUNTAR,
    tooltip: 'Verdadero si el robot esta parado sobre un engranaje.'
  },
  {
    type: 'desafio_en_la_marca',
    message0: 'estoy en la marca',
    output: 'Boolean',
    colour: COLOR_PREGUNTAR,
    tooltip: 'Verdadero si el robot esta sobre la marca del piso.'
  }
]);
