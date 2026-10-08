/**
 * ASTEROIDS — Phaser 3
 *
 * Fluxo das cenas (o coração de um jogo Phaser):
 *
 *   Carregamento  →  MenuPrincipal  →  Partida  →  FimDeJogo
 *                         ↑                              │
 *                         └──────────────────────────────┘
 *
 * Cada cena herda de Phaser.Scene e passa por 3 métodos:
 *   preload()  carrega imagens, sons, etc.
 *   create()   monta o que aparece na tela (roda 1 vez)
 *   update()   loop do jogo (cerca de 60 vezes por segundo)
 *
 * Dica para o ensino: para criar uma "Fase 2", copie a cena Partida,
 * troque o nome no super("Fase2") e chame this.scene.start("Fase2").
 */

const ESTILO_TITULO = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: "28px",
  color: "#7cf7ff",
  stroke: "#14002a",
  strokeThickness: 6,
};

const ESTILO_TEXTO = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: "12px",
  color: "#e8f0ff",
};

const ESTILO_HUD = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: "14px",
  color: "#ffffff",
  stroke: "#000000",
  strokeThickness: 4,
};

// Cada mapa muda apenas seus dados. A logica da cena Partida continua a mesma.
// Para ensinar uma nova fase, basta copiar um item e alterar seus valores.
const MAPAS = {
  orbita: {
    nome: "ORBITA AZUL",
    subtitulo: "equilibrado",
    cor: 0x68d7ff,
    tintFundo: 0x9fcfff,
    velocidadeFundo: 0.5,
    velocidadeInimigo: 2,
    intervalo: 1050,
  },
  nebulosa: {
    nome: "NEBULOSA RUBRA",
    subtitulo: "inimigos velozes",
    cor: 0xff668f,
    tintFundo: 0xff8ca8,
    velocidadeFundo: 0.75,
    velocidadeInimigo: 2.45,
    intervalo: 900,
  },
  tempestade: {
    nome: "TEMPESTADE COSMICA",
    subtitulo: "mais inimigos",
    cor: 0x7cffb2,
    tintFundo: 0x8dffcb,
    velocidadeFundo: 1,
    velocidadeInimigo: 2.2,
    intervalo: 700,
  },
};

// ============================================================
// CENA 1 — Carregamento
// Primeira cena do jogo: só existe para buscar os arquivos.
// Quando termina, pula para o menu.
// ============================================================
class Carregamento extends Phaser.Scene {
  constructor() {
    super("Carregamento");
    this.containerCarregamento = null;
    this.barraCarregamento = [];
  }

  preload() {
    // Caminho das imagens (pasta img na mesma pasta do HTML)
    this.load.setBaseURL("img");
    this.load.image("logo", "logo.png");
    this.load.image("espaco", "espaco.png");
    this.load.image("BotaoStart", "BotaoStart.png");
    this.load.image("nav2", "nav2.png");
    this.load.image("nav1", "nav1.png");
    this.load.image("nav3", "nav3.png");
    this.load.image("ast3", "as3.png");
    this.load.image("ast2", "as1.png");
    this.load.image("ast1", "as2.png");
    this.load.image("tiro", "tiro.png");

    this.cameras.main.setBackgroundColor("#07060f");

    const texto = this.add
      .text(400, 430, "CARREGANDO...", ESTILO_TEXTO)
      .setOrigin(0.5);

    this.containerCarregamento = this.add.container(300, 460);
    this.barraCarregamento.push(this.add.graphics());
    this.barraCarregamento.push(this.add.graphics());
    this.containerCarregamento.add(this.barraCarregamento);

    this.barraCarregamento[0].fillStyle(0x1a1040, 1);
    this.barraCarregamento[0].fillRoundedRect(0, 0, 200, 18, 4);
    this.barraCarregamento[0].lineStyle(2, 0x7cf7ff, 0.8);
    this.barraCarregamento[0].strokeRoundedRect(0, 0, 200, 18, 4);

    this.load.on(
      "progress",
      function (progresso) {
        this.barraCarregamento[1].clear();
        this.barraCarregamento[1].fillStyle(0x7cf7ff, 1);
        this.barraCarregamento[1].fillRoundedRect(2, 2, 196 * progresso, 14, 3);
        texto.setText("CARREGANDO " + Math.floor(progresso * 100) + "%");
      }.bind(this)
    );
  }

  create() {
    // Textura pequena usada nas explosões (gerada em código, sem arquivo extra)
    const particula = this.make.graphics({ x: 0, y: 0, add: false });
    particula.fillStyle(0xffe566, 1);
    particula.fillCircle(4, 4, 4);
    particula.generateTexture("particula", 8, 8);
    particula.destroy();

    // preload() já terminou aqui: podemos ir para a próxima cena
    this.scene.start("MenuPrincipal");
  }
}

// ============================================================
// CENA 2 — Menu principal
// Tela de entrada: fundo, título, botão e tecla para começar.
// this.scene.start("Partida") troca de cena e abre a fase.
// ============================================================
class MenuPrincipal extends Phaser.Scene {
  constructor() {
    super("MenuPrincipal");
    this.fundo = null;
  }

  create() {
    this.fundo = this.add.tileSprite(400, 300, 800, 600, "espaco");

    const recorde = parseInt(localStorage.getItem("asteroidsRecorde") || "0", 10);

    const logo = this.add.image(400, 55, "logo").setScale(0.24).setAlpha(0.9);

    const titulo = this.add
      .text(400, 122, "ASTEROIDS", ESTILO_TITULO)
      .setOrigin(0.5);

    this.add
      .text(400, 232, "desvie  •  atire  •  sobreviva", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#ffd56a",
      })
      .setOrigin(0.5);

    const mapaAtual = localStorage.getItem("asteroidsMapa") || "orbita";
    this.criarBotaoMapa(155, 290, "orbita", mapaAtual);
    this.criarBotaoMapa(400, 290, "nebulosa", mapaAtual);
    this.criarBotaoMapa(645, 290, "tempestade", mapaAtual);

    const playButton = this.add.sprite(400, 385, "BotaoStart").setScale(1.75);
    playButton.setInteractive({ useHandCursor: true });

    const controleAtual = localStorage.getItem("asteroidsControle") || "teclado";

    this.add
      .text(400, 445, controleAtual === "mouse"
        ? "MOUSE para voar   CLIQUE para atirar"
        : "SETAS para voar   ESPACO para atirar", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#9aa6c7",
        align: "center",
      })
      .setOrigin(0.5);

    this.criarBotaoTexto(400, 490, "OPCOES DE CONTROLE", () => {
      this.scene.start("OpcoesControle");
    });

    this.add
      .text(400, 535, "pressione ESPACO para comecar", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#7cf7ff",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 575, recorde > 0 ? "RECORDE  " + recorde : "BOA SORTE, PILOTO!", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#c44dff",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: titulo,
      scale: 1.08,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: playButton,
      y: 392,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: logo,
      alpha: 0.6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    playButton.on("pointerover", () => playButton.setTint(0xccffff));
    playButton.on("pointerout", () => playButton.clearTint());
    playButton.on("pointerup", () => this.iniciarPartida());

    this.input.keyboard.on("keydown-SPACE", () => this.iniciarPartida());
    this.input.keyboard.on("keydown-ENTER", () => this.iniciarPartida());
  }

  iniciarPartida() {
    // Troca a cena atual pela fase do jogo
    this.scene.start("Partida");
  }

  criarBotaoMapa(x, y, chave, mapaAtual) {
    const mapa = MAPAS[chave];
    const selecionado = chave === mapaAtual;
    const corFundo = selecionado ? 0x34226e : 0x15102c;
    const cartao = this.add
      .rectangle(x, y, 215, 90, corFundo, 0.96)
      .setStrokeStyle(selecionado ? 4 : 2, selecionado ? mapa.cor : 0x554477)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y - 17, mapa.nome, {
        ...ESTILO_TEXTO,
        fontSize: "9px",
        color: selecionado ? "#ffd56a" : "#7cf7ff",
        align: "center",
        wordWrap: { width: 190 },
      })
      .setOrigin(0.5);
    this.add
      .text(x, y + 18, mapa.subtitulo, {
        ...ESTILO_TEXTO,
        fontSize: "7px",
        color: "#aab6d6",
      })
      .setOrigin(0.5);

    cartao.on("pointerover", () => cartao.setFillStyle(0x2a1b58, 1));
    cartao.on("pointerout", () => cartao.setFillStyle(corFundo, 0.96));
    cartao.on("pointerup", () => {
      localStorage.setItem("asteroidsMapa", chave);
      this.scene.restart();
    });
  }

  criarBotaoTexto(x, y, rotulo, aoClicar) {
    const botao = this.add
      .text(x, y, rotulo, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "11px",
        color: "#7cf7ff",
        backgroundColor: "#1a1040",
        padding: { x: 14, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botao.on("pointerover", () => botao.setStyle({ color: "#ffd56a" }));
    botao.on("pointerout", () => botao.setStyle({ color: "#7cf7ff" }));
    botao.on("pointerup", aoClicar);
    return botao;
  }

  update() {
    // Faz o fundo parecer que a nave está viajando no espaço
    this.fundo.tilePositionY -= 0.35;
    this.fundo.tilePositionX += 0.12;
  }
}

// ============================================================
// CENA 3 - Opcoes de controle
// Salva a escolha no navegador para as proximas partidas.
// ============================================================
class OpcoesControle extends Phaser.Scene {
  constructor() {
    super("OpcoesControle");
    this.fundo = null;
  }

  create() {
    this.fundo = this.add.tileSprite(400, 300, 800, 600, "espaco");

    this.add.text(400, 105, "CONTROLES", ESTILO_TITULO).setOrigin(0.5);
    this.add
      .text(400, 155, "ESCOLHA COMO PILOTAR", ESTILO_TEXTO)
      .setOrigin(0.5);

    this.criarOpcao(
      400,
      245,
      "TECLADO",
      "SETAS: girar e acelerar\nESPACO: atirar",
      "teclado"
    );
    this.criarOpcao(
      400,
      375,
      "MOUSE",
      "MOVA: direcionar e acelerar\nCLIQUE: atirar",
      "mouse"
    );

    this.criarBotao(400, 520, "VOLTAR AO MENU", () => {
      this.scene.start("MenuPrincipal");
    });

    this.input.keyboard.on("keydown-ESC", () => this.scene.start("MenuPrincipal"));
  }

  criarOpcao(x, y, titulo, descricao, modo) {
    const selecionado = (localStorage.getItem("asteroidsControle") || "teclado") === modo;
    const fundo = this.add
      .rectangle(x, y, 520, 100, selecionado ? 0x34226e : 0x17102f, 0.96)
      .setStrokeStyle(3, selecionado ? 0x7cf7ff : 0x59498a)
      .setInteractive({ useHandCursor: true });

    const textoTitulo = this.add
      .text(x, y - 22, (selecionado ? "> " : "") + titulo, {
        ...ESTILO_TEXTO,
        color: selecionado ? "#ffd56a" : "#7cf7ff",
        fontSize: "14px",
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + 20, descricao, {
        ...ESTILO_TEXTO,
        color: "#b9c5e4",
        fontSize: "9px",
        align: "center",
        lineSpacing: 7,
      })
      .setOrigin(0.5);

    fundo.on("pointerover", () => fundo.setFillStyle(0x2a1b58, 1));
    fundo.on("pointerout", () => fundo.setFillStyle(selecionado ? 0x34226e : 0x17102f, 0.96));
    fundo.on("pointerup", () => {
      localStorage.setItem("asteroidsControle", modo);
      textoTitulo.setText("> " + titulo);
      this.scene.restart();
    });
  }

  criarBotao(x, y, rotulo, aoClicar) {
    const botao = this.add
      .text(x, y, rotulo, {
        ...ESTILO_TEXTO,
        color: "#7cf7ff",
        backgroundColor: "#1a1040",
        padding: { x: 16, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    botao.on("pointerover", () => botao.setStyle({ color: "#ffd56a" }));
    botao.on("pointerout", () => botao.setStyle({ color: "#7cf7ff" }));
    botao.on("pointerup", aoClicar);
  }

  update() {
    this.fundo.tilePositionY -= 0.3;
    this.fundo.tilePositionX += 0.1;
  }
}

// ============================================================
// CENA 4 - Partida (a fase)
// Aqui vive a lógica da jogabilidade: nave, tiros e asteroides.
// ============================================================
class Partida extends Phaser.Scene {
  constructor() {
    super("Partida");
    this.nav2 = null;
    this.nav1 = null;
    this.containerNave = null;
    this.asteroides = null;
    this.scoreText = null;
    this.score = 0;
    this.vida = 3;
    this.projectiles = null;
    this.vidaText = null;
    this.fundo = null;
    this.terminou = false;
  }

  create() {
    // create() roda de novo a cada partida: zere os valores aqui,
    // porque o constructor só executa uma vez.
    this.score = 0;
    this.vida = 3;
    this.terminou = false;
    this.colisaoProcessada = false;

    this.chaveMapa = localStorage.getItem("asteroidsMapa") || "orbita";
    this.mapa = MAPAS[this.chaveMapa] || MAPAS.orbita;

    this.fundo = this.add.tileSprite(400, 300, 800, 600, "espaco");
    this.fundo.setTint(this.mapa.tintFundo);
    this.criarDecoracaoMapa();

    this.containerNave = this.add.container(400, 300);

    this.nav2 = this.add.image(0, 0, "nav2");
    this.nav2.setScale(2);

    this.nav1 = this.add.image(0, 0, "nav1");
    this.nav1.setScale(2);
    this.nav1.setVisible(false);

    this.containerNave.add(this.nav1);
    this.containerNave.add(this.nav2);

    this.physics.world.enable(this.containerNave);
    this.containerNave.body.setSize(28, 28);
    this.containerNave.body.setOffset(-14, -14);

    this.shipSpeed = 5;
    this.modoControle = localStorage.getItem("asteroidsControle") || "teclado";
    this.ultimoTiroMouse = 0;
    this.podeAtirar = false;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("SPACE");
    this.time.delayedCall(280, () => {
      this.podeAtirar = true;
    });

    this.projectiles = this.physics.add.group();
    this.asteroides = this.add.group();

    this.criarHud();

    this.time.addEvent({
      delay: this.mapa.intervalo,
      loop: true,
      callback: this.criarAsteroide,
      callbackScope: this,
    });

    // Um único overlap para todos os tiros e asteroides
    this.physics.add.overlap(
      this.projectiles,
      this.asteroides,
      this.acertoTiro,
      null,
      this
    );

    this.cameras.main.flash(400, 80, 40, 160);
  }

  criarHud() {
    this.add.rectangle(400, 28, 800, 56, 0x07060f, 0.45).setScrollFactor(0);

    this.scoreText = this.add.text(16, 18, "SCORE  0", ESTILO_HUD);
    this.vidaText = this.add.text(620, 18, "VIDAS", ESTILO_HUD);
    this.add
      .text(400, 23, this.mapa.nome, {
        ...ESTILO_HUD,
        fontSize: "9px",
        color: "#ffd56a",
      })
      .setOrigin(0.5);

    this.iconesVida = [];
    for (let i = 0; i < 3; i++) {
      const icone = this.add.image(720 + i * 26, 28, "nav2").setScale(1.2);
      this.iconesVida.push(icone);
    }
  }

  criarDecoracaoMapa() {
    const decoracao = this.add.graphics().setAlpha(0.28);

    if (this.chaveMapa === "nebulosa") {
      decoracao.fillStyle(0xff386f, 0.18);
      decoracao.fillCircle(120, 170, 115);
      decoracao.fillCircle(690, 430, 155);
    } else if (this.chaveMapa === "tempestade") {
      decoracao.lineStyle(1, 0x7cffb2, 0.22);
      for (let x = 0; x <= 800; x += 80) decoracao.lineBetween(x, 0, x, 600);
      for (let y = 0; y <= 600; y += 80) decoracao.lineBetween(0, y, 800, y);
    } else {
      decoracao.lineStyle(2, 0x68d7ff, 0.18);
      decoracao.strokeCircle(400, 300, 210);
      decoracao.strokeCircle(400, 300, 330);
    }
  }

  atualizarHud() {
    this.scoreText.setText("SCORE  " + this.score);
    this.iconesVida.forEach((icone, indice) => {
      icone.setAlpha(indice < this.vida ? 1 : 0.2);
    });
  }

  mostrarPonto(x, y, valor) {
    const txt = this.add
      .text(x, y, "+" + valor, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: "#7CFF8E",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 36,
      alpha: 0,
      duration: 650,
      onComplete: () => txt.destroy(),
    });
  }

  criarExplosao(x, y) {
    const explosao = this.add.particles(x, y, "particula", {
      speed: { min: 40, max: 180 },
      lifespan: 420,
      scale: { start: 1.4, end: 0 },
      blendMode: "ADD",
      emitting: false,
      tint: [0xffaa33, 0xffee88, 0xffffff],
    });
    explosao.explode(14);
    this.time.delayedCall(500, () => explosao.destroy());
  }

  acertoTiro(tiro, asteroide) {
    const valor = asteroide.valor || 10;
    this.criarExplosao(asteroide.x, asteroide.y);
    this.mostrarPonto(asteroide.x, asteroide.y, valor);
    this.cameras.main.shake(80, 0.004);

    tiro.destroy();
    asteroide.destroy();

    this.score += valor;
    this.atualizarHud();

    this.tweens.add({
      targets: this.scoreText,
      scale: 1.12,
      duration: 80,
      yoyo: true,
    });
  }

  collisaoNaveAsteroide(containerNave, asteroide) {
    if (this.colisaoProcessada || this.terminou) {
      return;
    }

    this.vida -= 1;
    this.atualizarHud();
    this.colisaoProcessada = true;
    this.criarExplosao(asteroide.x, asteroide.y);
    this.cameras.main.shake(180, 0.01);
    this.cameras.main.flash(180, 180, 30, 30);

    this.tweens.add({
      targets: this.containerNave,
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: 6,
      onComplete: () => this.containerNave.setAlpha(1),
    });

    this.time.delayedCall(1000, () => {
      this.colisaoProcessada = false;
    });

    asteroide.destroy();
  }

  criarAsteroide() {
    if (this.terminou) {
      return;
    }

    let x, y;
    const side = Phaser.Math.Between(0, 3);

    switch (side) {
      case 0:
        x = Phaser.Math.Between(0, this.cameras.main.width);
        y = 0;
        break;
      case 1:
        x = this.cameras.main.width;
        y = Phaser.Math.Between(0, this.cameras.main.height);
        break;
      case 2:
        x = Phaser.Math.Between(0, this.cameras.main.width);
        y = this.cameras.main.height;
        break;
      default:
        x = 0;
        y = Phaser.Math.Between(0, this.cameras.main.height);
        break;
    }

    const tipos = [
      { nome: "ROCHA", textura: "ast3", escala: 4, velocidade: 0.8, valor: 10, fragmenta: true },
      { nome: "METEORO", textura: "ast2", escala: 2.6, velocidade: 1.6, valor: 15, fragmenta: false },
      { nome: "CRISTAL", textura: "ast1", escala: 2, velocidade: 1.15, valor: 20, fragmenta: false, ondula: true },
    ];
    const tipo = Phaser.Utils.Array.GetRandom(tipos);
    const asteroidePrincipal = this.add.sprite(x, y, tipo.textura).setOrigin(0.5);
    asteroidePrincipal.setScale(tipo.escala);
    if (tipo.nome === "METEORO") asteroidePrincipal.setTint(0xffaa66);
    if (tipo.nome === "CRISTAL") asteroidePrincipal.setTint(0x7cf7ff);
    asteroidePrincipal.direction = Phaser.Math.Between(0, 360);
    asteroidePrincipal.tipoInimigo = tipo.nome;
    asteroidePrincipal.fatorVelocidade = tipo.velocidade;
    asteroidePrincipal.valor = tipo.valor;
    asteroidePrincipal.ondula = tipo.ondula || false;
    asteroidePrincipal.faseOnda = Phaser.Math.FloatBetween(0, Math.PI * 2);
    asteroidePrincipal.grande = tipo.fragmenta;
    this.physics.add.existing(asteroidePrincipal);
    asteroidePrincipal.body.setCircle(asteroidePrincipal.width / 2);

    this.physics.add.overlap(
      this.containerNave,
      asteroidePrincipal,
      this.collisaoNaveAsteroide,
      null,
      this
    );

    this.asteroides.add(asteroidePrincipal);

    asteroidePrincipal.on("destroy", () => {
      if (asteroidePrincipal.grande) {
        this.criarAsteroideMenor(asteroidePrincipal.x, asteroidePrincipal.y);
        this.criarAsteroideMenor(asteroidePrincipal.x, asteroidePrincipal.y);
      }
    });
  }

  criarAsteroideMenor(x, y) {
    if (this.terminou || x === undefined) {
      return;
    }

    const textura = Phaser.Math.Between(0, 1) === 0 ? "ast2" : "ast1";
    const asteroideMenor = this.add.sprite(x, y, textura).setOrigin(0.5);
    asteroideMenor.setScale(2);
    asteroideMenor.direction = Phaser.Math.Between(0, 360);
    asteroideMenor.grande = false;
    asteroideMenor.tipoInimigo = "FRAGMENTO";
    asteroideMenor.fatorVelocidade = 1.35;
    asteroideMenor.valor = 5;
    asteroideMenor.ondula = false;
    this.physics.add.existing(asteroideMenor);
    asteroideMenor.body.setCircle(asteroideMenor.width / 2);

    this.physics.add.overlap(
      this.containerNave,
      asteroideMenor,
      this.collisaoNaveAsteroide,
      null,
      this
    );

    this.asteroides.add(asteroideMenor);
  }

  envolverTela(objeto) {
    const largura = this.cameras.main.width;
    const altura = this.cameras.main.height;
    const margem = 20;

    if (objeto.x > largura + margem) objeto.x = -margem;
    else if (objeto.x < -margem) objeto.x = largura + margem;
    if (objeto.y > altura + margem) objeto.y = -margem;
    else if (objeto.y < -margem) objeto.y = altura + margem;
  }

  update() {
    if (this.terminou) {
      return;
    }

    this.fundo.tilePositionY -= this.mapa.velocidadeFundo;
    this.fundo.tilePositionX += this.mapa.velocidadeFundo * 0.3;

    if (this.vida <= 0) {
      this.finalizarPartida();
      return;
    }

    let acelerando = false;

    if (this.modoControle === "mouse") {
      const ponteiro = this.input.activePointer;
      const distancia = Phaser.Math.Distance.Between(
        this.containerNave.x,
        this.containerNave.y,
        ponteiro.worldX,
        ponteiro.worldY
      );

      // A imagem da nave aponta para cima; por isso somamos 90 graus.
      this.containerNave.rotation = Phaser.Math.Angle.Between(
        this.containerNave.x,
        this.containerNave.y,
        ponteiro.worldX,
        ponteiro.worldY
      ) + Math.PI / 2;

      acelerando = distancia > 35;
      if (this.podeAtirar && ponteiro.isDown && this.time.now > this.ultimoTiroMouse + 220) {
        this.fireProjectile();
        this.ultimoTiroMouse = this.time.now;
      }
    } else {
      if (this.cursors.left.isDown) {
        this.containerNave.angle -= 10;
      } else if (this.cursors.right.isDown) {
        this.containerNave.angle += 10;
      }
      acelerando = this.cursors.up.isDown;
    }

    // O espaco tambem funciona no modo mouse como alternativa.
    if (this.podeAtirar && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      this.fireProjectile();
    }

    this.nav1.setVisible(acelerando);
    this.nav2.setVisible(!acelerando);

    if (acelerando) {
      const radians = Phaser.Math.DegToRad(this.containerNave.angle - 90);
      const speed = this.shipSpeed;
      this.containerNave.x += Math.cos(radians) * speed;
      this.containerNave.y += Math.sin(radians) * speed;
    }

    this.envolverTela(this.containerNave);

    const velocidadeAsteroide = this.mapa.velocidadeInimigo + Math.min(this.score / 250, 2);

    this.asteroides.getChildren().forEach((asteroide) => {
      let direcao = asteroide.direction;
      if (asteroide.ondula) {
        direcao += Math.sin(this.time.now / 260 + asteroide.faseOnda) * 38;
      }
      const radians = Phaser.Math.DegToRad(direcao);
      const velocidade = velocidadeAsteroide * (asteroide.fatorVelocidade || 1);
      asteroide.angle += asteroide.tipoInimigo === "METEORO" ? 2.2 : 0.8;
      asteroide.x += Math.cos(radians) * velocidade;
      asteroide.y += Math.sin(radians) * velocidade;
      this.envolverTela(asteroide);
    });
  }

  fireProjectile() {
    const radians = Phaser.Math.DegToRad(this.containerNave.angle - 90);
    const spawnSpeed = 18;
    const moveSpeed = 500;

    const tiro = this.add
      .sprite(
        this.containerNave.x + Math.cos(radians) * spawnSpeed,
        this.containerNave.y + Math.sin(radians) * spawnSpeed,
        "tiro"
      )
      .setOrigin(0.5);
    tiro.setScale(2);
    tiro.rotation = this.containerNave.rotation;

    this.projectiles.add(tiro);
    this.physics.world.enable(tiro);
    tiro.body.setVelocity(Math.cos(radians) * moveSpeed, Math.sin(radians) * moveSpeed);

    this.time.delayedCall(1400, () => {
      if (tiro.active) {
        tiro.destroy();
      }
    });
  }

  finalizarPartida() {
    this.terminou = true;
    this.criarExplosao(this.containerNave.x, this.containerNave.y);
    this.containerNave.setVisible(false);

    const recorde = parseInt(localStorage.getItem("asteroidsRecorde") || "0", 10);
    if (this.score > recorde) {
      localStorage.setItem("asteroidsRecorde", String(this.score));
    }

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(550, () => {
      // Passa a pontuação para a próxima cena pelo segundo argumento
      this.scene.start("FimDeJogo", { score: this.score });
    });
  }
}

// ============================================================
// CENA 5 - Fim de jogo
// init(dados) recebe o que a cena anterior enviou em scene.start().
// Daqui o jogador volta ao menu ou recomeça a fase.
// ============================================================
class FimDeJogo extends Phaser.Scene {
  constructor() {
    super("FimDeJogo");
    this.scoreFinal = 0;
    this.fundo = null;
  }

  init(dados) {
    this.scoreFinal = dados && dados.score ? dados.score : 0;
  }

  create() {
    this.fundo = this.add.tileSprite(400, 300, 800, 600, "espaco");

    const recorde = parseInt(localStorage.getItem("asteroidsRecorde") || "0", 10);
    const novoRecorde = this.scoreFinal >= recorde && this.scoreFinal > 0;

    const titulo = this.add
      .text(400, 160, "FIM DE JOGO", ESTILO_TITULO)
      .setOrigin(0.5);

    this.add
      .text(400, 240, "PONTOS  " + this.scoreFinal, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#ffd56a",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 280, novoRecorde ? "NOVO RECORDE!" : "RECORDE  " + recorde, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "12px",
        color: novoRecorde ? "#7CFF8E" : "#c44dff",
      })
      .setOrigin(0.5);

    const botaoDeNovo = this.criarBotaoTexto(400, 380, "JOGAR DE NOVO", () => {
      this.scene.start("Partida");
    });

    this.criarBotaoTexto(400, 450, "VOLTAR AO MENU", () => {
      this.scene.start("MenuPrincipal");
    });

    this.tweens.add({
      targets: titulo,
      scale: 1.06,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: botaoDeNovo,
      scale: 1.06,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.time.delayedCall(300, () => {
      this.input.keyboard.on("keydown-SPACE", () => this.scene.start("Partida"));
      this.input.keyboard.on("keydown-ENTER", () => this.scene.start("Partida"));
    });
  }

  criarBotaoTexto(x, y, rotulo, aoClicar) {
    const botao = this.add
      .text(x, y, rotulo, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "14px",
        color: "#7cf7ff",
        backgroundColor: "#1a1040",
        padding: { x: 16, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botao.on("pointerover", () => botao.setStyle({ color: "#ffd56a" }));
    botao.on("pointerout", () => botao.setStyle({ color: "#7cf7ff" }));
    botao.on("pointerup", aoClicar);
    return botao;
  }

  update() {
    this.fundo.tilePositionY -= 0.25;
  }
}

// Configuração do Phaser: tamanho, física e lista de cenas.
// A primeira cena do array é a que começa automaticamente.
const config = {
  type: Phaser.AUTO,
  parent: "phaser-game",
  width: 800,
  height: 600,
  backgroundColor: "#07060f",
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Carregamento, MenuPrincipal, OpcoesControle, Partida, FimDeJogo],
};

// Espera o HTML carregar para achar a div #phaser-game
window.addEventListener("load", function () {
  new Phaser.Game(config);
});
