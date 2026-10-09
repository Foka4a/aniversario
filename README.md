# O Fio da Nova Vida

Homenagem com rolagem lateral: a página anda para o lado seguindo um cordão de luzinhas, com fotos penduradas e mensagens em cada momento.

## Rodar no computador

Precisa do **Node 22.12 ou mais novo** (`node -v` para conferir).

```bash
npm install
npm run dev
```

Abra http://localhost:4321. Cada vez que você salva um arquivo, a página atualiza sozinha.

## Onde editar

| O quê | Onde |
| --- | --- |
| Nome, frases, datas, títulos, mensagens, legendas, ordem dos momentos | `src/conteudo.ts` |
| Fotos | pasta `src/fotos/` |

Campo vazio (`''`) mostra o espaço reservado do esboço, então dá para ir preenchendo aos poucos.

### Fotos

1. Copie as fotos para `src/fotos/`.
2. Em `src/conteudo.ts`, escreva só o nome do arquivo: `arquivo: 'praia.jpg'`.

- Aceita jpg, png, webp e avif. Fotos de iPhone em **HEIC** precisam ser convertidas para JPG antes.
- Pode usar a foto original do celular: no build cada uma é reduzida e convertida para WebP em vários tamanhos.
- Se o nome estiver errado, o espaço da foto avisa `não achei "arquivo.jpg"`.
- `foco` escolhe a parte da foto que fica visível no recorte: `foco: 'top'`, `foco: '30% 20%'`.
- `formato` troca a proporção de uma foto específica: `'retrato'`, `'quadrada'` ou `'paisagem'`.

### Arranjos de fotos

Cada momento escolhe como as fotos ficam penduradas com `arranjo`:

| arranjo | fotos | como fica |
| --- | --- | --- |
| `grande` | 1 | uma polaroid vertical grande |
| `dupla` | 2 | duas verticais lado a lado |
| `quadrada` | 1 | uma quadrada, com espaço para mensagem longa |
| `panoramica` | 1 | uma horizontal larga |
| `tirinha` | até 3 | tirinha de cabine de fotos (a legenda vem da 1ª foto) |
| `leque` | 3 | três pequenas abertas em leque |

Sem `arranjo`, ele escolhe pela quantidade: 1 foto = grande, 2 = dupla, 3 = leque.

### Momentos

Para adicionar um momento, copie um bloco `{ ... }` dentro de `momentos` e cole onde quiser. Para remover, apague o bloco. O fio se redesenha sozinho, alternando fotos penduradas e apoiadas.

## Publicar

```bash
npm run build
```

A página pronta fica em `dist/`.

### Render (Static Site)

| Campo | Valor |
| --- | --- |
| Tipo de serviço | Static Site |
| Branch | `main` |
| Root Directory | (vazio) |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

A versão do Node vem do arquivo `.node-version` (24). A cada `git push` na `main`, o Render publica de novo sozinho.

## Como funciona

- **Astro** gera uma página estática e otimiza as fotos (`astro:assets`).
- **GSAP ScrollTrigger** fixa o palco e transforma a rolagem vertical em deslocamento horizontal. **Lenis** deixa a rolagem suave.
- O fio (`src/scripts/fio.ts`) é calculado a partir da posição real de cada estação e dividido em trechos. Durante a rolagem só o trecho que está sendo desenhado é repintado.
- As luzes do fundo (`src/components/Ceu.astro`) são geradas no build em três camadas que só se deslocam, sem redesenhar nada.

Ajustes rápidos:

- Cores: variáveis no topo de `src/styles/global.css`.
- Desenho dos loops: lista `DESENHOS` em `src/scripts/fio.ts` (`k` = número de voltas, `rf` = tamanho).
- Espaço entre os momentos: `--vao` em `src/styles/global.css`.
