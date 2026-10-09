import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { construirFio, type Fio } from './fio';

gsap.registerPlugin(ScrollTrigger);

const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const palco = document.getElementById('palco')!;
const trilha = document.getElementById('trilha')!;
const svg = document.getElementById('fio') as unknown as SVGSVGElement;
const estacoes = Array.from(trilha.querySelectorAll<HTMLElement>('.estacao'));
const camadas = Array.from(document.querySelectorAll<HTMLElement>('.camada'));
const rotulo = document.getElementById('rotulo')!;
const progresso = document.getElementById('progresso')!;
const btnAnterior = document.getElementById('anterior') as HTMLButtonElement;
const btnProximo = document.getElementById('proximo') as HTMLButtonElement;

/* ---------- rolagem suave ---------- */
let lenis: Lenis | null = null;
if (!movimentoReduzido) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, gestureOrientation: 'both' });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- medidas ---------- */
let W = window.innerWidth;
let H = palco.clientHeight;
let distancia = 1;
let centros: number[] = [];
let fio: Fio | null = null;
let atual = -1;
const profundidades = camadas.map((c) => Number(c.dataset.prof) || 0);

function medir() {
  W = window.innerWidth;
  H = palco.clientHeight;
  document.documentElement.style.setProperty('--H', `${H}px`);
  distancia = Math.max(1, trilha.scrollWidth - W);
  centros = estacoes.map((e) => e.offsetLeft + e.offsetWidth / 2);
  camadas.forEach((c, i) => (c.style.width = `${W + distancia * profundidades[i]}px`));
}
medir();

/* ---------- a trilha anda para o lado enquanto a página rola ---------- */
const st = ScrollTrigger.create({
  trigger: palco,
  pin: true,
  start: 'top top',
  end: () => `+=${distancia}`,
  scrub: true,
  invalidateOnRefresh: true,
  onRefreshInit: medir,
  onRefresh: (self) => {
    fio = construirFio(svg, trilha, estacoes, W, H);
    desenhar(self.progress);
  },
  onUpdate: (self) => desenhar(self.progress),
});

function desenhar(p: number) {
  const x = p * distancia;
  trilha.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
  camadas.forEach((c, i) => (c.style.transform = `translate3d(${(-x * profundidades[i]).toFixed(2)}px,0,0)`));

  if (fio) {
    const frente = x + W * (0.64 + 0.36 * p);
    fio.revelar(movimentoReduzido ? Infinity : fio.comprimentoEm(frente));
  }

  const meio = x + W / 2;
  let melhor = Infinity,
    n = 0;
  centros.forEach((c, i) => {
    const d = Math.abs(c - meio);
    if (d < melhor) {
      melhor = d;
      n = i;
    }
  });
  if (n !== atual) {
    atual = n;
    rotulo.textContent = estacoes[n].dataset.rotulo ?? '';
  }
  progresso.style.transform = `scaleX(${p.toFixed(4)})`;
  btnAnterior.disabled = p < 0.002;
  btnProximo.disabled = p > 0.998;
}

/* ---------- botões e teclado ---------- */
const posicaoDe = (i: number) => gsap.utils.clamp(0, distancia, centros[i] - W / 2);
const atualX = () => st.progress * distancia;

function irPara(i: number) {
  const y = st.start + (posicaoDe(i) / distancia) * (st.end - st.start);
  if (lenis) lenis.scrollTo(y, { duration: 1.3 });
  else window.scrollTo({ top: y });
}
function proximo() {
  const i = centros.findIndex((_, k) => posicaoDe(k) > atualX() + 4);
  if (i >= 0) irPara(i);
}
function anterior() {
  for (let k = centros.length - 1; k >= 0; k--) if (posicaoDe(k) < atualX() - 4) return irPara(k);
}

btnProximo.addEventListener('click', proximo);
btnAnterior.addEventListener('click', anterior);
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    proximo();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    anterior();
  }
});

/* refaz as medidas quando as fontes terminam de carregar (o texto muda de largura) */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
