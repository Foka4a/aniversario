import type { Homenagem } from './tipos';

/* ==========================================================================
   CONTEÚDO DA HOMENAGEM — edite aqui
   --------------------------------------------------------------------------
   • Textos: troque as strings vazias '' pelo que você quiser escrever.
     Campo vazio = a página mostra o espaço reservado (como no esboço).
   • Fotos: coloque os arquivos em `src/fotos/` e escreva só o nome
     do arquivo em `arquivo:` (ex.: arquivo: 'praia.jpg').
   • Mensagens longas: use crases (`) para quebrar linha à vontade.
     Uma linha em branco separa parágrafos.
   • Momentos: pode adicionar, remover ou reordenar à vontade;
     o fio se redesenha sozinho.
   ========================================================================== */

export const homenagem: Homenagem = {
  tituloDaAba: 'Feliz aniversário!',

  nome: 'Maria Clara',

  abertura: {
    chamada: 'Uma homenagem para',
    frase: '',
    dicaFrase: 'Meus parabéns, pequena! Aproveite seu dia e lembre-se que você é muito amada.',
    foto: { arquivo: 'juntos.jpeg', legenda: 'Sendo ameaçado' },
  },

  momentos: [
    {
      data: 'Essa é velha',
      titulo: 'Foto no senai com aquele celular bomba',
      mensagem: 'Uma das primeiras fotos que tiramos kkkkk',
      dica: 'Como tudo começou? Conte o primeiro passo dessa nova vida.',
      arranjo: 'grande',
      fotos: [{ arquivo: 'michael.jpeg', legenda: 'Auuuuuuu! Michael Jackson' }],
    },
    {
      data: '01/11/2023',
      titulo: 'Esse rolê foi foda!',
      mensagem: 'Seu cabelo estava muito fofo nesse dia',
      dica: 'Uma das primeiras fotos que tiramos kkkkk',
      arranjo: 'dupla',
      fotos: [
        { arquivo: 'gabrielita.jpeg', legenda: 'Pai tava torto' },
        { arquivo: 'mariaita.jpeg', legenda: 'Olhando o Rio' },
      ],
    },
    {
      data: '23/08/2026',
      titulo: 'Olhos lindos',
      mensagem: 'Uma das fotos que mais gosto, simplesmente um dos melhores dias ao seu lado. Ansioso por mais momentos como estes.',
      dica: 'O que você admira nela nessa fase? Aqui cabe um texto maior.',
      arranjo: 'quadrada',
      fotos: [{ arquivo: 'flor.jpeg', legenda: 'Que olhar!' }],
    },
    {
      data: '19/04/2026',
      titulo: 'Cachoeira Foda',
      mensagem: 'O mais legal desse dia é que tudo foi organizado de última hora kkkkkkk',
      dica: '',
      arranjo: 'tirinha',
      fotos: [
        { arquivo: 'cachoeira1.jpeg', legenda: 'Deus quase levou' },
        { arquivo: 'cachoeira3.jpeg' },
        { arquivo: 'cachoeira2.jpeg' },
      ],
    },
    {
      data: '23/08/2026',
      titulo: 'Mais uma no meio do mato',
      mensagem: 'Temos poucas fotos juntos, mas isso só mostra que aproveitamos melhor cada momento nosso.',
      dica: '',
      arranjo: 'panoramica',
      fotos: [{ arquivo: 'laemcasa.jpeg', legenda: 'Lá em casa' }],
    },
    {
      data: '//',
      titulo: 'Mais alguns momentos incríveis',
      mensagem: 'Alguns momentos que provam que tudo que vivemos juntos é incrivel!',
      dica: 'Um desejo seu para o que vem pela frente.',
      arranjo: 'leque',
      fotos: [
        { arquivo: 'milly.jpeg', legenda: 'Estilosas' },
        { arquivo: 'beldade.jpeg', legenda: 'Maravilhosa' },
        { arquivo: 'miau.jpeg', legenda: 'Miauuu' },
      ],
    },
  ],

  final: {
    titulo: 'Um ultimo recado',
    mensagem: 'Feliz aniversário Maria, aproveita seu dia, isso foi apenas uma pequena demonstração do quanto você é especial para mim, e que eu te amo muito. Que venham muitos outros momentos juntos, e que possamos aproveitar cada um deles da melhor forma possível.',
    dica: 'A carta: o que você quer que ela leia por último.',
    assinatura: 'Gabriel',
  },

  encerramento: 'e amanhã tem mais...',
};
