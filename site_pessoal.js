document.addEventListener("DOMContentLoaded", function () {
    // Seleciona o menu e o espaçador para evitar salto no layout
    const nav = document.getElementById('main-nav');
    const spacer = document.getElementById('nav-spacer');
    const navTop = nav.offsetTop;

    // Função throttle para limitar chamadas frequentes (ex: scroll)
    function throttle(fn, wait) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= wait) {
                fn.apply(this, args);
                lastTime = now;
            }
        };
    }

    // Evento de scroll com throttle para fixar o menu no topo
    window.addEventListener('scroll', throttle(function () {
        if (window.scrollY >= navTop) {
            nav.classList.add('fixed-nav');
            spacer.style.height = nav.offsetHeight + 'px'; // evita salto
        } else {
            nav.classList.remove('fixed-nav');
            spacer.style.height = '0px';
        }
    }, 100));
});

// Seleção dos elementos do carrossel
const container = document.querySelector(".carrossel-conteiner");
const slides = document.querySelectorAll(".carrossel-slide");
const prevBtn = document.querySelector(".carrossel-btn.prev");
const nextBtn = document.querySelector(".carrossel-btn.next");

let slidesToShow = 3; // Quantidade de slides visíveis
const totalSlides = slides.length;
let maxIndex = totalSlides - slidesToShow; // Índice máximo para não ultrapassar
let currentIndex = 0; // Índice atual do carrossel
let autoPlayInterval; // Intervalo do autoplay
let slideWidth; // Largura do slide + gap

// Atualiza slides visíveis conforme largura da tela (responsividade)
function updateSlidesToShow() {
    if (window.innerWidth <= 768) {
        slidesToShow = 1;
    } else {
        slidesToShow = 3;
    }
    maxIndex = totalSlides - slidesToShow;
    if (maxIndex < 0) maxIndex = 0;
}

// Calcula largura do slide + gap para movimentação correta
function calculateSlideWidth() {
    const style = getComputedStyle(container);
    const gap = parseInt(style.gap) || 0;
    slideWidth = slides[0].offsetWidth + gap;
}

// Atualiza a posição do carrossel usando transform para melhor performance
function updateCarousel() {
    container.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
}

// Reinicia o autoplay, evitando múltiplos intervalos
function resetAutoplay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => {
        currentIndex += slidesToShow;
        if (currentIndex > maxIndex) currentIndex = 0;
        updateCarousel();
    }, 4000);
}

// Botão anterior
prevBtn.addEventListener("click", () => {
    currentIndex -= slidesToShow;
    if (currentIndex < 0) {
        currentIndex = maxIndex;
    }
    updateCarousel();
    resetAutoplay();
});

// Botão próximo
nextBtn.addEventListener("click", () => {
    currentIndex += slidesToShow;
    if (currentIndex > maxIndex) {
        currentIndex = 0;
    }
    updateCarousel();
    resetAutoplay();
});

// Atualiza configurações ao redimensionar a janela
window.addEventListener('resize', () => {
    updateSlidesToShow();
    calculateSlideWidth();
    currentIndex = 0;
    updateCarousel();
});

// Inicialização
updateSlidesToShow();
calculateSlideWidth();
updateCarousel();
resetAutoplay();
