import type { ImageMetadata } from 'astro';
import type { Arranjo, Formato, Momento } from '../tipos';

/* Todas as imagens de src/fotos são encontradas aqui e otimizadas no build (WebP, vários tamanhos). */
const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  '../fotos/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}',
  { eager: true },
);

const porNome = new Map<string, ImageMetadata>();
for (const [caminho, mod] of Object.entries(arquivos)) {
  const nome = caminho.split('/').pop()!;
  porNome.set(nome.toLowerCase(), mod.default);
}

export function acharFoto(arquivo?: string): ImageMetadata | undefined {
  if (!arquivo) return undefined;
  return porNome.get(arquivo.trim().toLowerCase());
}

export const proporcao: Record<Formato, string> = {
  retrato: '4 / 5',
  quadrada: '1 / 1',
  paisagem: '3 / 2',
};

export const nomeFormato: Record<Formato, string> = {
  retrato: 'vertical 4:5',
  quadrada: 'quadrada 1:1',
  paisagem: 'horizontal 3:2',
};

export function arranjoDe(m: Momento): Arranjo {
  if (m.arranjo) return m.arranjo;
  const n = m.fotos.length;
  if (n >= 3) return 'leque';
  if (n === 2) return 'dupla';
  return 'grande';
}

export const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** Inclinações das polaroids, repetidas em ciclo para parecerem penduradas à mão. */
const giros = [-2, 3.5, -4, 2.5, -1.5, 4, -3, 1.5, -2.5, 3];
export const giro = (i: number) => giros[i % giros.length];
