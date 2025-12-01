document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("main-nav");
  const spacer = document.getElementById("nav-spacer");

  let navTop = nav.offsetTop;

  function fixarNav() {
    const navAltura = nav.offsetHeight;

    if (window.scrollY >= navTop) {
      if (!nav.classList.contains("fixed-nav")) {
        nav.classList.add("fixed-nav");

        // calcula de novo a altura já com padding reduzido
        requestAnimationFrame(() => {
          spacer.style.height = nav.offsetHeight + "px";
        });
      }
    } else {
      nav.classList.remove("fixed-nav");
      spacer.style.height = "0px";
    }
  }

  window.addEventListener("scroll", fixarNav);

  // Recalcula quando a janela muda de tamanho
  window.addEventListener("resize", () => {
    navTop = nav.offsetTop;
    if (nav.classList.contains("fixed-nav")) {
      spacer.style.height = nav.offsetHeight + "px";
    }
  });

  fixarNav();
});

// ====== SCRIPT DO CARROSSEL RESPONSIVO ======
(function () {
  const carrossel = document.querySelector('.carrossel');
  const faixa = carrossel.querySelector('.faixa_carrossel');
  const slides = Array.from(faixa.children);
  const botaoAnterior = carrossel.querySelector('.anterior');
  const botaoProximo = carrossel.querySelector('.proximo');
  const pontosContainer = carrossel.querySelector('.pontos_carrossel');
  const status = document.getElementById('status_carrossel');

  let indiceAtual = 0;
  const intervalo = 4000;
  let temporizador = null;
  let pausado = false;

  // ====== FUNÇÃO QUE CALCULA QUANTOS SLIDES CABEM ======
  function calcularSlidesVisiveis() {
    const largura = window.innerWidth;
    if (largura < 600) return 1; // celular
    if (largura < 1024) return 2; // tablet
    return 3; // desktop
  }

  let slidesVisiveis = calcularSlidesVisiveis();
  let totalSlides = slides.length;
  let maxIndice = totalSlides - slidesVisiveis;

  // ====== CRIAÇÃO DOS PONTOS ======
  function criarPontos() {
    pontosContainer.innerHTML = "";
    for (let i = 0; i <= maxIndice; i++) {
      const ponto = document.createElement('button');
      ponto.className = 'ponto_carrossel';
      ponto.type = 'button';
      ponto.setAttribute('aria-label', `Ir para grupo ${i + 1}`);
      ponto.dataset.indice = i;
      if (i === 0) ponto.setAttribute('aria-current', 'true');
      pontosContainer.appendChild(ponto);
    }
  }

  criarPontos();
  const pontos = () => Array.from(pontosContainer.children);

  // ====== FUNÇÃO PRINCIPAL ======
  function irPara(indice) {
    let novoIndice = indice;
    if (novoIndice < 0) novoIndice = maxIndice;
    if (novoIndice > maxIndice) novoIndice = 0;

    const deslocamento = -(novoIndice * (100 / slidesVisiveis));
    faixa.style.transform = `translateX(${deslocamento}%)`;

    indiceAtual = novoIndice;
    atualizarIndicadores();
    atualizarStatus();
  }

  function proximo() { irPara(indiceAtual + 1); }
  function anterior() { irPara(indiceAtual - 1); }

  function atualizarIndicadores() {
    pontos().forEach((p, i) => {
      if (i === indiceAtual) p.setAttribute('aria-current', 'true');
      else p.removeAttribute('aria-current');
    });
  }

  function atualizarStatus() {
    status.textContent = `Grupo ${indiceAtual + 1} de ${maxIndice + 1}`;
  }

  // ====== EVENTOS ======
  carrossel.addEventListener('mouseenter', () => { pausado = true; });
  carrossel.addEventListener('mouseleave', () => { pausado = false; });

  let inicioX = 0, deltaX = 0;
  carrossel.addEventListener('touchstart', e => { inicioX = e.touches[0].clientX; pausado = true; }, { passive: true });
  carrossel.addEventListener('touchmove', e => { deltaX = e.touches[0].clientX - inicioX; }, { passive: true });
  carrossel.addEventListener('touchend', () => {
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) proximo(); else anterior();
    }
    deltaX = 0; pausado = false; reiniciarAuto();
  });

  botaoProximo.addEventListener('click', () => { proximo(); reiniciarAuto(); });
  botaoAnterior.addEventListener('click', () => { anterior(); reiniciarAuto(); });

  pontosContainer.addEventListener('click', e => {
    if (e.target.matches('.ponto_carrossel')) {
      const i = Number(e.target.dataset.indice);
      irPara(i);
      reiniciarAuto();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { proximo(); reiniciarAuto(); }
    if (e.key === 'ArrowLeft') { anterior(); reiniciarAuto(); }
  });

  // ====== AUTO PLAY ======
  function iniciarAuto() {
    if (temporizador) clearInterval(temporizador);
    temporizador = setInterval(() => {
      if (!pausado) proximo();
    }, intervalo);
  }
  function reiniciarAuto() {
    clearInterval(temporizador);
    iniciarAuto();
  }

  // ====== REAJUSTE AO REDIMENSIONAR ======
  window.addEventListener('resize', () => {
    const novo = calcularSlidesVisiveis();
    if (novo !== slidesVisiveis) {
      slidesVisiveis = novo;
      maxIndice = totalSlides - slidesVisiveis;
      criarPontos();
      irPara(0);
    }
  });

  // ====== INICIALIZA ======
  irPara(0);
  iniciarAuto();
})();
