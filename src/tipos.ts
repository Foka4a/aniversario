/**
 * Tipos do conteúdo da homenagem.
 * Você não precisa mexer aqui: edite tudo em `src/conteudo.ts`.
 */

/** Proporção do quadro da foto. Se não informar, cada arranjo usa a sua. */
export type Formato = 'retrato' | 'quadrada' | 'paisagem';

/**
 * Como as fotos de um momento aparecem penduradas no fio.
 * - grande:     1 foto vertical grande
 * - dupla:      2 fotos verticais lado a lado
 * - quadrada:   1 foto quadrada
 * - panoramica: 1 foto horizontal larga
 * - tirinha:    tirinha de cabine com até 3 fotos quadradas
 * - leque:      3 fotos pequenas abertas em leque
 */
export type Arranjo = 'grande' | 'dupla' | 'quadrada' | 'panoramica' | 'tirinha' | 'leque';

export interface Foto {
  /** Nome do arquivo dentro de `src/fotos/` (ex.: "praia.jpg"). Vazio = mostra o espaço reservado. */
  arquivo?: string;
  /** Texto escrito à mão embaixo da polaroid. */
  legenda?: string;
  /** Muda a proporção do quadro desta foto. */
  formato?: Formato;
  /** Ponto da foto que fica sempre visível no recorte (CSS object-position). Ex.: "top", "30% 20%". */
  foco?: string;
}

export interface Momento {
  /** Data livre: "12/03/2025", "verão de 2024", "março"... */
  data?: string;
  titulo?: string;
  /** Texto da mensagem. Deixe uma linha em branco para separar parágrafos. */
  mensagem?: string;
  /** Pergunta-guia que aparece enquanto a mensagem estiver vazia. */
  dica?: string;
  /** Se não informar: 1 foto = grande, 2 = dupla, 3 = leque. */
  arranjo?: Arranjo;
  fotos: Foto[];
}

export interface Homenagem {
  /** Texto da aba do navegador. */
  tituloDaAba: string;
  nome: string;
  abertura: {
    chamada: string;
    frase?: string;
    dicaFrase?: string;
    foto: Foto;
  };
  momentos: Momento[];
  final: {
    titulo: string;
    mensagem?: string;
    dica?: string;
    assinatura?: string;
  };
  /** Frase escrita à mão no fim do fio. */
  encerramento: string;
}
