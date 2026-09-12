/* JHF Desafios - dibujo del tablero
   Todo se dibuja en un canvas. El robot se mueve entre casilleros con una
   animacion corta, para que se vea el paso y no aparezca del otro lado. */

class Tablero {
  constructor(lienzo, escenario) {
    this.lienzo = lienzo;
    this.pincel = lienzo.getContext('2d');
    this.escenario = escenario;

    // Donde se dibuja el robot ahora mismo, que no siempre coincide con
    // donde esta en el escenario: durante el paso esta en el medio
    this.robotDibujado = { x: escenario.robot.x, y: escenario.robot.y, angulo: 0 };
    this.brillo = null;      // casillero resaltado cuando junta algo
    this.sacudida = 0;       // cuanto tiembla despues de un choque

    this.medir();
  }

  medir() {
    const caja = this.lienzo.parentElement.getBoundingClientRect();
    const escala = window.devicePixelRatio || 1;

    this.lienzo.width = caja.width * escala;
    this.lienzo.height = caja.height * escala;
    this.lienzo.style.width = caja.width + 'px';
    this.lienzo.style.height = caja.height + 'px';
    this.pincel.setTransform(escala, 0, 0, escala, 0, 0);

    // El casillero mas grande que entre, dejando un borde
    const margen = 16;
    this.celda = Math.floor(Math.min(
      (caja.width - margen * 2) / this.escenario.ancho,
      (caja.height - margen * 2) / this.escenario.alto
    ));

    this.origenX = Math.round((caja.width - this.celda * this.escenario.ancho) / 2);
    this.origenY = Math.round((caja.height - this.celda * this.escenario.alto) / 2);
  }

  aPantalla(x, y) {
    return {
      x: this.origenX + x * this.celda,
      y: this.origenY + y * this.celda
    };
  }

  /* ---------- Dibujo ---------- */

  dibujar() {
    const p = this.pincel;
    const e = this.escenario;
    const c = this.celda;

    p.clearRect(0, 0, this.lienzo.width, this.lienzo.height);

    p.save();
    if (this.sacudida > 0) {
      p.translate((Math.random() - 0.5) * this.sacudida, (Math.random() - 0.5) * this.sacudida);
    }

    this.dibujarCasilleros();

    if (e.meta) this.dibujarMeta(e.meta.x, e.meta.y);
    for (const pared of e.paredes) this.dibujarPared(pared.x, pared.y);
    for (const objeto of e.objetos) {
      if (!objeto.tomado) this.dibujarEngranaje(objeto.x, objeto.y);
    }
    if (this.brillo) this.dibujarBrillo();

    this.dibujarRobot();

    p.restore();
  }

  dibujarCasilleros() {
    const p = this.pincel;
    const c = this.celda;

    for (let y = 0; y < this.escenario.alto; y++) {
      for (let x = 0; x < this.escenario.ancho; x++) {
        const s = this.aPantalla(x, y);
        // Tablero de ajedrez suave, para poder contar los casilleros
        p.fillStyle = (x + y) % 2 === 0 ? '#F4F8F5' : '#E8F0EA';
        p.fillRect(s.x, s.y, c, c);
      }
    }

    p.strokeStyle = '#D2DED5';
    p.lineWidth = 1;
    for (let x = 0; x <= this.escenario.ancho; x++) {
      const s = this.aPantalla(x, 0);
      p.beginPath();
      p.moveTo(s.x + 0.5, this.origenY);
      p.lineTo(s.x + 0.5, this.origenY + this.escenario.alto * c);
      p.stroke();
    }
    for (let y = 0; y <= this.escenario.alto; y++) {
      const s = this.aPantalla(0, y);
      p.beginPath();
      p.moveTo(this.origenX, s.y + 0.5);
      p.lineTo(this.origenX + this.escenario.ancho * c, s.y + 0.5);
      p.stroke();
    }
  }

  dibujarPared(x, y) {
    const p = this.pincel;
    const c = this.celda;
    const s = this.aPantalla(x, y);
    const m = Math.round(c * 0.06);

    p.fillStyle = '#5E7266';
    this.rectanguloRedondeado(s.x + m, s.y + m, c - m * 2, c - m * 2, c * 0.12);
    p.fill();

    // Ladrillos, para que se lea como pared y no como mancha
    p.strokeStyle = 'rgba(255,255,255,.22)';
    p.lineWidth = Math.max(1, c * 0.03);
    for (let i = 1; i < 3; i++) {
      const alto = s.y + m + (c - m * 2) * i / 3;
      p.beginPath();
      p.moveTo(s.x + m, alto);
      p.lineTo(s.x + c - m, alto);
      p.stroke();
    }
  }

  dibujarMeta(x, y) {
    const p = this.pincel;
    const c = this.celda;
    const s = this.aPantalla(x, y);
    const centro = { x: s.x + c / 2, y: s.y + c / 2 };

    p.strokeStyle = '#10893F';
    p.lineWidth = Math.max(2, c * 0.06);
    p.setLineDash([c * 0.12, c * 0.09]);
    p.beginPath();
    p.arc(centro.x, centro.y, c * 0.34, 0, Math.PI * 2);
    p.stroke();
    p.setLineDash([]);

    p.fillStyle = 'rgba(16, 137, 63, .16)';
    p.beginPath();
    p.arc(centro.x, centro.y, c * 0.22, 0, Math.PI * 2);
    p.fill();
  }

  dibujarEngranaje(x, y) {
    const p = this.pincel;
    const c = this.celda;
    const s = this.aPantalla(x, y);
    const cx = s.x + c / 2;
    const cy = s.y + c / 2;
    const radio = c * 0.24;

    p.save();
    p.translate(cx, cy);

    p.fillStyle = '#F58220';
    p.strokeStyle = '#101C2C';
    p.lineWidth = Math.max(1.5, c * 0.025);

    // Dientes
    for (let i = 0; i < 8; i++) {
      p.save();
      p.rotate((Math.PI * 2 / 8) * i);
      const ancho = radio * 0.34;
      p.beginPath();
      p.rect(-ancho / 2, -radio * 1.34, ancho, radio * 0.42);
      p.fill();
      p.stroke();
      p.restore();
    }

    p.beginPath();
    p.arc(0, 0, radio, 0, Math.PI * 2);
    p.fill();
    p.stroke();

    p.fillStyle = '#FFFFFF';
    p.beginPath();
    p.arc(0, 0, radio * 0.36, 0, Math.PI * 2);
    p.fill();
    p.stroke();

    p.restore();
  }

  dibujarBrillo() {
    const p = this.pincel;
    const c = this.celda;
    const s = this.aPantalla(this.brillo.x, this.brillo.y);

    p.fillStyle = 'rgba(57, 255, 20, ' + (0.5 * this.brillo.fuerza) + ')';
    p.beginPath();
    p.arc(s.x + c / 2, s.y + c / 2, c * 0.5 * (1.6 - this.brillo.fuerza * 0.6), 0, Math.PI * 2);
    p.fill();
  }

  dibujarRobot() {
    const p = this.pincel;
    const c = this.celda;
    const s = this.aPantalla(this.robotDibujado.x, this.robotDibujado.y);
    const cx = s.x + c / 2;
    const cy = s.y + c / 2;

    p.save();
    p.translate(cx, cy);
    p.rotate(this.robotDibujado.angulo * Math.PI / 180);

    const u = c / 100;   // para escribir las medidas como porcentaje del casillero

    // Sombra en el piso
    p.fillStyle = 'rgba(22, 38, 28, .12)';
    p.beginPath();
    p.ellipse(0, 34 * u, 30 * u, 9 * u, 0, 0, Math.PI * 2);
    p.fill();

    // Ruedas
    p.fillStyle = '#33443A';
    this.rectanguloRedondeado(-32 * u, -18 * u, 14 * u, 36 * u, 5 * u);
    p.fill();
    this.rectanguloRedondeado(18 * u, -18 * u, 14 * u, 36 * u, 5 * u);
    p.fill();

    // Cuerpo
    p.fillStyle = '#F58220';
    p.strokeStyle = '#101C2C';
    p.lineWidth = Math.max(1.5, 2.6 * u);
    this.rectanguloRedondeado(-24 * u, -26 * u, 48 * u, 52 * u, 10 * u);
    p.fill();
    p.stroke();

    // Pantalla de la cara, mirando hacia adelante
    p.fillStyle = '#101C2C';
    this.rectanguloRedondeado(-6 * u, -17 * u, 26 * u, 34 * u, 6 * u);
    p.fill();

    // Ojos
    p.fillStyle = '#39FF14';
    p.beginPath();
    p.arc(10 * u, -8 * u, 4.2 * u, 0, Math.PI * 2);
    p.arc(10 * u, 8 * u, 4.2 * u, 0, Math.PI * 2);
    p.fill();

    // Antena
    p.strokeStyle = '#101C2C';
    p.beginPath();
    p.moveTo(-14 * u, -26 * u);
    p.lineTo(-20 * u, -36 * u);
    p.stroke();
    p.fillStyle = '#39FF14';
    p.beginPath();
    p.arc(-21 * u, -38 * u, 4 * u, 0, Math.PI * 2);
    p.fill();

    p.restore();
  }

  rectanguloRedondeado(x, y, ancho, alto, radio) {
    const p = this.pincel;
    p.beginPath();
    p.moveTo(x + radio, y);
    p.arcTo(x + ancho, y, x + ancho, y + alto, radio);
    p.arcTo(x + ancho, y + alto, x, y + alto, radio);
    p.arcTo(x, y + alto, x, y, radio);
    p.arcTo(x, y, x + ancho, y, radio);
    p.closePath();
  }
}

if (typeof window !== 'undefined') window.Tablero = Tablero;
