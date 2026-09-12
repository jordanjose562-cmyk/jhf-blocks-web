/* JHF Desafios - los desafios
   El orden importa: cada uno agrega una idea nueva y solo muestra los bloques
   que hacen falta. Si le doy todos los bloques desde el principio, el chico
   elige al azar en vez de pensar. */

const DESAFIOS = [

/* ---------- Primeros pasos: dar ordenes en orden ---------- */

{
  id: 'primer-paso',
  grupo: 'Primeros pasos',
  nombre: 'El primer paso',
  consigna: 'Llevá el robot hasta la marca verde.',
  ayuda: 'Un bloque de avanzar mueve el robot un casillero.',
  bloques: ['desafio_avanzar'],
  mapa: {
    ancho: 4, alto: 1,
    robot: { x: 0, y: 0, direccion: 0 },
    meta: { x: 3, y: 0 },
    objetivo: { llegarALaMeta: true }
  }
},

{
  id: 'primer-engranaje',
  grupo: 'Primeros pasos',
  nombre: 'Juntar un engranaje',
  consigna: 'Andá hasta el engranaje, juntalo, y seguí hasta la marca.',
  ayuda: 'Para juntarlo hay que estar parado justo encima.',
  bloques: ['desafio_avanzar', 'desafio_juntar'],
  mapa: {
    ancho: 5, alto: 1,
    robot: { x: 0, y: 0, direccion: 0 },
    objetos: [{ x: 2, y: 0 }],
    meta: { x: 4, y: 0 },
    objetivo: { juntarTodo: true, llegarALaMeta: true }
  }
},

{
  id: 'la-esquina',
  grupo: 'Primeros pasos',
  nombre: 'Doblar en la esquina',
  consigna: 'El camino dobla. Usá el bloque de girar.',
  ayuda: 'Girar no mueve al robot: solo lo hace mirar para otro lado.',
  bloques: ['desafio_avanzar', 'desafio_girar', 'desafio_juntar'],
  mapa: {
    ancho: 4, alto: 4,
    robot: { x: 0, y: 0, direccion: 0 },
    paredes: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    objetos: [{ x: 3, y: 2 }],
    meta: { x: 3, y: 3 },
    objetivo: { juntarTodo: true, llegarALaMeta: true }
  }
},

/* ---------- Repetir: la misma orden muchas veces ---------- */

{
  id: 'pasillo-largo',
  grupo: 'Repetir',
  nombre: 'El pasillo largo',
  consigna: 'Son ocho casilleros. Podés poner ocho bloques de avanzar, o usar el de repetir.',
  ayuda: 'El bloque repetir hace lo de adentro la cantidad de veces que le digas.',
  bloques: ['desafio_avanzar', 'desafio_repetir'],
  mapa: {
    ancho: 9, alto: 1,
    robot: { x: 0, y: 0, direccion: 0 },
    meta: { x: 8, y: 0 },
    objetivo: { llegarALaMeta: true, pasosMaximos: 10 }
  }
},

{
  id: 'la-vuelta',
  grupo: 'Repetir',
  nombre: 'Dar la vuelta',
  consigna: 'Hay un engranaje en cada esquina. Recorré el borde juntándolos todos.',
  ayuda: 'El recorrido es cuatro veces lo mismo: tres pasos, juntar, y doblar.',
  bloques: ['desafio_avanzar', 'desafio_girar', 'desafio_juntar', 'desafio_repetir'],
  mapa: {
    ancho: 4, alto: 4,
    robot: { x: 0, y: 0, direccion: 0 },
    paredes: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    objetos: [{ x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }, { x: 0, y: 0 }],
    objetivo: { juntarTodo: true }
  }
},

/* ---------- Preguntar: que el robot decida ---------- */

{
  id: 'hasta-la-marca',
  grupo: 'Preguntar',
  nombre: 'Hasta que llegue',
  consigna: 'No sabés cuántos casilleros hay. Usá el repetir que se corta al llegar.',
  ayuda: 'Este repetir no lleva numero: se fija solo cuando el robot pisa la marca.',
  bloques: ['desafio_avanzar', 'desafio_hasta_llegar'],
  mapa: {
    ancho: 7, alto: 1,
    robot: { x: 0, y: 0, direccion: 0 },
    meta: { x: 6, y: 0 },
    objetivo: { llegarALaMeta: true }
  }
},

{
  id: 'juntar-los-que-haya',
  grupo: 'Preguntar',
  nombre: 'Juntar los que haya',
  consigna: 'Recorré el pasillo juntando engranajes. Pero solo hay en algunos casilleros.',
  ayuda: 'Antes de juntar, preguntá si hay un engranaje. Si juntás donde no hay, el robot se traba.',
  bloques: ['desafio_avanzar', 'desafio_juntar', 'desafio_repetir',
            'desafio_si', 'desafio_hay_engranaje'],
  mapa: {
    ancho: 8, alto: 1,
    robot: { x: 0, y: 0, direccion: 0 },
    objetos: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 6, y: 0 }],
    meta: { x: 7, y: 0 },
    objetivo: { juntarTodo: true, llegarALaMeta: true }
  }
},

{
  id: 'el-obstaculo',
  grupo: 'Preguntar',
  nombre: 'Esquivar la pared',
  consigna: 'El camino serpentea. El robot tiene que decidir solo cuándo doblar.',
  ayuda: 'Adentro del repetir: si el camino esta libre, avanzar. Si no, doblar a la derecha.',
  bloques: ['desafio_avanzar', 'desafio_girar', 'desafio_juntar',
            'desafio_hasta_llegar', 'desafio_si', 'desafio_si_sino',
            'desafio_puede_avanzar', 'desafio_hay_engranaje'],
  mapa: {
    ancho: 5, alto: 4,
    robot: { x: 0, y: 0, direccion: 1 },
    paredes: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
              { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }],
    objetos: [{ x: 0, y: 2 }],
    meta: { x: 4, y: 3 },
    objetivo: { juntarTodo: true, llegarALaMeta: true }
  }
},

/* ---------- Hacerlo mejor: la misma solucion con menos bloques ---------- */

{
  id: 'la-escalera',
  grupo: 'Hacerlo mejor',
  nombre: 'La escalera',
  consigna: 'Subí la escalera hasta la marca. Se puede con pocos bloques si encontrás el patrón.',
  ayuda: 'Mirá el recorrido: avanzar, doblar, avanzar, doblar. Eso se repite.',
  bloques: ['desafio_avanzar', 'desafio_girar', 'desafio_repetir'],
  mapa: {
    ancho: 5, alto: 5,
    robot: { x: 0, y: 4, direccion: 3 },
    paredes: [{ x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
              { x: 2, y: 3 }, { x: 3, y: 3 },
              { x: 3, y: 2 },
              { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 },
              { x: 1, y: 0 }, { x: 2, y: 0 }],
    meta: { x: 4, y: 0 },
    objetivo: { llegarALaMeta: true, pasosMaximos: 16 }
  }
},

{
  id: 'la-espiral',
  grupo: 'Hacerlo mejor',
  nombre: 'Todo el tablero',
  consigna: 'Juntá los seis engranajes. Tratá de usar la menor cantidad de bloques.',
  ayuda: 'Combiná repetir con preguntar si hay un engranaje.',
  bloques: ['desafio_avanzar', 'desafio_girar', 'desafio_juntar', 'desafio_repetir',
            'desafio_si', 'desafio_hay_engranaje'],
  mapa: {
    ancho: 6, alto: 3,
    robot: { x: 0, y: 0, direccion: 0 },
    objetos: [{ x: 1, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 1 },
              { x: 5, y: 1 }, { x: 0, y: 2 }, { x: 3, y: 2 }],
    objetivo: { juntarTodo: true }
  }
}

];

if (typeof window !== 'undefined') window.DESAFIOS = DESAFIOS;
if (typeof module !== 'undefined') module.exports = DESAFIOS;
