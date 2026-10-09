/*
 * O fio de luzinhas.
 *
 * O traçado é calculado a partir da posição real de cada estação: uma leve "barriga" sob as fotos,
 * travessias com loops entre um momento e outro e uma espiral no fim.
 *
 * Para rodar leve, o fio é dividido em trechos (um <g> por trecho). Durante a rolagem só o trecho
 * que está sendo desenhado muda; os outros ficam parados, então o navegador repinta uma área pequena.
 */

type P = { x: number; y: number };

const NS = 'http://www.w3.org/2000/svg';
const PASSO = 3; // distância entre pontos do traçado (px)
const BARRIGA = 8; // quanto o fio cede sob cada estação
const TORCAO_AMP = 1.7; // afastamento dos dois fios do cordão
const TORCAO_ONDA = 24; // comprimento de uma volta da torção

/* desenhos das travessias, usados em ciclo: um loop grande, dois loops, uma mola de duas voltas */
const DESENHOS = [
  [{ tc: 0.5, w: 0.58, k: 1, rf: 0.27 }],
  [
    { tc: 0.32, w: 0.36, k: 1, rf: 0.18 },
    { tc: 0.68, w: 0.36, k: 1, rf: 0.18 },
  ],
  [{ tc: 0.5, w: 0.68, k: 2, rf: 0.2 }],
];

type Trecho = {
  g: SVGGElement;
  caminhos: { el: SVGPathElement; len: Float32Array }[];
  centro: Float32Array; // comprimento acumulado (global) do eixo do trecho
  inicio: number;
  fim: number;
  lampadas: { l: number; el: SVGGElement }[];
  acesas: number;
  estado: 'vazio' | 'parcial' | 'cheio';
};

export interface Fio {
  /** Converte a posição horizontal na trilha em comprimento de fio. */
  comprimentoEm(x: number): number;
  /** Mostra o fio até o comprimento L. */
  revelar(L: number): void;
  total: number;
}

const suave = (z: number) => z * z * (3 - 2 * z);
const f1 = (n: number) => n.toFixed(1);

type Faixa = { x1: number; x2: number; y: number };

function travessia(pts: P[], a: Faixa, b: Faixa, desenho: (typeof DESENHOS)[number], gi: number) {
  const ax = a.x2,
    ay = a.y,
    bx = b.x1,
    by = b.y,
    dx = bx - ax;
  const c1 = ax + dx * 0.55,
    c2 = bx - dx * 0.55;
  const base = (u: number): P => {
    const m = 1 - u;
    return {
      x: m * m * m * ax + 3 * m * m * u * c1 + 3 * m * u * u * c2 + u * u * u * bx,
      y: (m * m * m + 3 * m * m * u) * ay + (3 * m * u * u + u * u * u) * by,
    };
  };

  /* o fio "desacelera" onde faz a volta, para o loop fechar redondo */
  const N = 720;
  const U = new Float64Array(N + 1);
  let anterior = 0;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let v = 1;
    for (const L of desenho) {
      const z = (t - L.tc) / (L.w / 2);
      if (z > -1 && z < 1) v -= 0.97 * (0.5 + 0.5 * Math.cos(Math.PI * z));
    }
    v = Math.max(0.03, v);
    if (i) U[i] = U[i - 1] + (anterior + v) / 2;
    anterior = v;
  }
  for (let i = 1; i <= N; i++) U[i] /= U[N];

  const loops = desenho.map((L) => {
    const uc = U[Math.round(L.tc * N)];
    const p = base(uc),
      q = base(Math.min(1, uc + 0.003)),
      o = base(Math.max(0, uc - 0.003));
    let tx = q.x - o.x,
      ty = q.y - o.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    let nx = -ty,
      ny = tx;
    const lado = L.tc < 0.45 ? 1 : L.tc > 0.55 ? -1 : gi % 2 ? 1 : -1;
    if (nx * lado < 0) {
      nx = -nx;
      ny = -ny;
    }
    const livre = lado > 0 ? bx - 22 - p.x : p.x - ax - 22;
    const r = Math.max(12, Math.min(L.rf * dx, livre / (2 * Math.abs(nx) + Math.abs(tx) + 0.01)));
    return { a: L.tc - L.w / 2, w: L.w, k: L.k, tx, ty, nx, ny, r };
  });

  for (let i = 1; i <= N; i++) {
    const t = i / N,
      p = base(U[i]);
    let x = p.x,
      y = p.y;
    for (const L of loops) {
      const z = (t - L.a) / L.w;
      if (z > 0 && z < 1) {
        const ang = 2 * Math.PI * L.k * suave(z),
          s = Math.sin(ang),
          c = 1 - Math.cos(ang);
        x += L.r * (s * L.tx + c * L.nx);
        y += L.r * (s * L.ty + c * L.ny);
      }
    }
    pts.push({ x, y });
  }
}

function espiral(pts: P[], r: Faixa, H: number) {
  const R0 = Math.max(28, Math.min(42, H * 0.055)),
    R1 = 5,
    voltas = 1.75,
    cauda = R0 + 26,
    y = r.y;
  const nC = Math.ceil(cauda / 6);
  for (let j = 1; j <= nC; j++) pts.push({ x: r.x2 + (cauda * j) / nC, y });
  const cx = r.x2 + cauda,
    cy = y - R0,
    M = 280;
  for (let j = 1; j <= M; j++) {
    const s = j / M,
      th = Math.PI / 2 - s * voltas * 2 * Math.PI,
      rho = R1 + (R0 - R1) * (1 - s * s);
    pts.push({ x: cx + rho * Math.cos(th), y: cy + rho * Math.sin(th) });
  }
  return cx + R0;
}

/** Reamostra a polilinha em passos iguais. */
function reamostrar(pts: P[]): P[] {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = acc[acc.length - 1];
  const out: P[] = [pts[0]];
  let j = 1;
  for (let s = PASSO; s < total; s += PASSO) {
    while (acc[j] < s) j++;
    const k = (s - acc[j - 1]) / (acc[j] - acc[j - 1] || 1);
    out.push({ x: pts[j - 1].x + (pts[j].x - pts[j - 1].x) * k, y: pts[j - 1].y + (pts[j].y - pts[j - 1].y) * k });
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function dDe(arr: P[]) {
  let s = 'M' + f1(arr[0].x) + ' ' + f1(arr[0].y);
  for (let i = 1; i < arr.length; i++) s += 'L' + f1(arr[i].x) + ' ' + f1(arr[i].y);
  return s;
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  return e;
}

export function construirFio(svg: SVGSVGElement, trilha: HTMLElement, estacoes: HTMLElement[], W: number, H: number): Fio {
  const largura = Math.ceil(trilha.scrollWidth);
  svg.setAttribute('width', String(largura));
  svg.setAttribute('height', String(H));
  svg.setAttribute('viewBox', `0 0 ${largura} ${H}`);
  svg.textContent = '';

  /* faixa horizontal ocupada por cada estação e a altura onde o fio passa */
  const faixas: Faixa[] = estacoes.map((est) => {
    const c = est.querySelector<HTMLElement>('.conteudo')!;
    const x1 = est.offsetLeft + c.offsetLeft - 16;
    const topo = est.offsetTop + c.offsetTop;
    return {
      x1,
      x2: x1 + c.offsetWidth + 32,
      y: est.classList.contains('pendurado') ? topo : topo + c.offsetHeight,
    };
  });
  faixas[0].x1 = 0;

  /* 1. pontos brutos de cada trecho */
  const brutos: { pts: P[]; x0: number; x1: number }[] = [];
  let fimX = 0;
  faixas.forEach((r, i) => {
    const sob: P[] = [{ x: r.x1, y: r.y }];
    const len = r.x2 - r.x1,
      n = Math.max(2, Math.ceil(len / 6));
    for (let j = 1; j <= n; j++) {
      const u = j / n,
        sv = Math.sin(Math.PI * u);
      sob.push({ x: r.x1 + len * u, y: r.y + BARRIGA * sv * sv });
    }
    brutos.push({ pts: sob, x0: r.x1, x1: r.x2 });

    const prox = faixas[i + 1];
    const meio: P[] = [{ x: r.x2, y: r.y }];
    if (prox) {
      travessia(meio, r, prox, DESENHOS[i % DESENHOS.length], i);
      brutos.push({ pts: meio, x0: r.x2, x1: prox.x1 });
    } else {
      fimX = espiral(meio, r, H);
      brutos.push({ pts: meio, x0: r.x2, x1: fimX });
    }
  });

  /* 2. cada trecho vira um grupo com rastro, brilho, cordão torcido e lâmpadas */
  const trechos: Trecho[] = [];
  const ancoras: { x: number; l: number }[] = [];
  const passoLampada = W < 600 ? 30 : 38;
  let proximaLampada = 12;
  let global = 0;
  let k = 0;

  brutos.forEach((b, bi) => {
    const P = reamostrar(b.pts);
    const n = P.length;
    const A: P[] = new Array(n),
      B: P[] = new Array(n);
    const centro = new Float32Array(n),
      lenA = new Float32Array(n),
      lenB = new Float32Array(n),
      lenC = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      if (i) {
        const d = Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
        lenC[i] = lenC[i - 1] + d;
      }
      centro[i] = global + lenC[i];
      const p0 = P[Math.max(0, i - 1)],
        p1 = P[Math.min(n - 1, i + 1)];
      let nx = -(p1.y - p0.y),
        ny = p1.x - p0.x;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      const o = TORCAO_AMP * Math.sin((2 * Math.PI * centro[i]) / TORCAO_ONDA);
      A[i] = { x: P[i].x + nx * o, y: P[i].y + ny * o };
      B[i] = { x: P[i].x - nx * o, y: P[i].y - ny * o };
      if (i) {
        lenA[i] = lenA[i - 1] + Math.hypot(A[i].x - A[i - 1].x, A[i].y - A[i - 1].y);
        lenB[i] = lenB[i - 1] + Math.hypot(B[i].x - B[i - 1].x, B[i].y - B[i - 1].y);
      }
    }

    const g = el('g', { class: 'trecho' });
    const dC = dDe(P);
    g.appendChild(el('path', { class: 'rastro', d: dC }));
    const brilho = el('path', { class: 'brilho', d: dC });
    const cordB = el('path', { class: 'cordao b', d: dDe(B) });
    const cordA = el('path', { class: 'cordao a', d: dDe(A) });
    g.append(brilho, cordB, cordA);
    const caminhos = [
      { el: brilho, len: lenC },
      { el: cordB, len: lenB },
      { el: cordA, len: lenA },
    ];
    for (const c of caminhos) {
      const T = f1(c.len[n - 1] + 2);
      c.el.setAttribute('stroke-dasharray', `${T} ${T}`);
      c.el.setAttribute('stroke-dashoffset', T);
    }

    const lampadas: Trecho['lampadas'] = [];
    const gl = el('g', {});
    const ultimo = bi === brutos.length - 1;
    for (let i = 0; i < n; i++) {
      if (centro[i] >= proximaLampada && !(ultimo && i > n - 8)) {
        const lg = el('g', { class: `lampada c${k++ % 3}`, transform: `translate(${f1(P[i].x)} ${f1(P[i].y)})` });
        lg.append(el('circle', { class: 'aura', r: 11 }), el('circle', { class: 'halo', r: 6 }), el('circle', { class: 'nucleo', r: 2.4 }));
        gl.appendChild(lg);
        lampadas.push({ l: centro[i], el: lg });
        proximaLampada += passoLampada;
      }
    }
    if (ultimo) {
      const fimP = P[n - 1];
      const lg = el('g', { class: 'lampada c0', transform: `translate(${f1(fimP.x)} ${f1(fimP.y)})` });
      lg.append(el('circle', { class: 'aura', r: 30 }), el('circle', { class: 'halo', r: 14 }), el('circle', { class: 'nucleo', r: 5 }));
      gl.appendChild(lg);
      lampadas.push({ l: centro[n - 1], el: lg });
    }
    g.appendChild(gl);
    svg.appendChild(g);

    ancoras.push({ x: b.x0, l: global });
    trechos.push({ g, caminhos, centro, inicio: global, fim: global + lenC[n - 1], lampadas, acesas: 0, estado: 'vazio' });
    global += lenC[n - 1];
  });
  ancoras.push({ x: Math.max(fimX, ancoras[ancoras.length - 1].x + 1), l: global });

  function comprimentoEm(x: number) {
    if (x <= ancoras[0].x) return 0;
    for (let i = 1; i < ancoras.length; i++) {
      const a = ancoras[i - 1],
        b = ancoras[i];
      if (x <= b.x) return a.l + (b.l - a.l) * (b.x > a.x ? (x - a.x) / (b.x - a.x) : 1);
    }
    return global;
  }

  function acender(t: Trecho, L: number) {
    let n = 0;
    while (n < t.lampadas.length && t.lampadas[n].l <= L) n++;
    if (n > t.acesas) for (let i = t.acesas; i < n; i++) t.lampadas[i].el.classList.add('acesa');
    else for (let i = n; i < t.acesas; i++) t.lampadas[i].el.classList.remove('acesa');
    t.acesas = n;
  }

  function revelar(L: number) {
    for (const t of trechos) {
      if (L >= t.fim) {
        if (t.estado !== 'cheio') {
          for (const c of t.caminhos) c.el.setAttribute('stroke-dashoffset', '0');
          acender(t, Infinity);
          t.estado = 'cheio';
        }
      } else if (L <= t.inicio) {
        if (t.estado !== 'vazio') {
          for (const c of t.caminhos) c.el.setAttribute('stroke-dashoffset', f1(c.len[c.len.length - 1] + 2));
          acender(t, -1);
          t.estado = 'vazio';
        }
      } else {
        let lo = 0,
          hi = t.centro.length - 1;
        while (lo < hi) {
          const m = (lo + hi + 1) >> 1;
          if (t.centro[m] <= L) lo = m;
          else hi = m - 1;
        }
        for (const c of t.caminhos) {
          const total = c.len[c.len.length - 1] + 2;
          c.el.setAttribute('stroke-dashoffset', f1(total - c.len[lo]));
        }
        acender(t, L);
        t.estado = 'parcial';
      }
    }
  }

  return { comprimentoEm, revelar, total: global };
}
