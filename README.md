# HIVEFRONT / pageGames

Protótipo de RTS 3D de colônia de abelhas para web.

A proposta é combinar base-building, economia, produção de unidades e defesa de ondas com uma identidade própria de colmeia, sem copiar facções, unidades ou interface de jogos existentes.

## Loop atual

1. Selecione operárias clicando nelas.
2. Clique em flores para iniciar coleta de néctar.
3. As operárias carregam néctar, voltam à colmeia/depósito e repetem a rota.
4. Use o painel inferior para produzir operárias e guardiãs.
5. Construa berçários, depósitos e torres clicando no botão e depois no terreno.
6. Ondas de vespas surgem periodicamente; selecione unidades e clique nos inimigos para atacar.
7. Torres atacam automaticamente inimigos em alcance.

## Controles

- Clique: selecionar unidade / dar ordem contextual.
- Shift + clique: adicionar ou remover unidade da seleção.
- Clique no terreno: mover unidades selecionadas.
- Clique em flores: coletar com operárias.
- Clique em vespas: atacar com unidades selecionadas.
- Mouse: câmera orbital via React Three Fiber / Drei.

## Stack

- React 19 + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- Zustand
- Koota (base ECS disponível para evolução)
- Rapier
- Howler.js
- Vitest
- ESLint + Prettier

## Assets

Os conceitos visuais ficam em `public/assets/bees/`.

- Operária
- Guardiã
- Rainha
- Colmeia
- Recurso floral de néctar

A cena 3D atual usa geometria procedural leve para manter o protótipo jogável enquanto modelos GLB definitivos não existem.

## Rodando

```bash
npm install
npm run dev
```

## Validação

```bash
npm run build
npm test
npm run lint
```

## Próximos passos

- seleção por caixa (drag selection);
- fog of war;
- pathfinding/flow field real com obstáculos;
- IA inimiga com ninho e objetivos;
- árvore de evolução da rainha;
- modelos GLB/animations para castas de abelha e vespas;
- áudio espacial e feedback de combate;
- migrar a simulação pesada para Web Worker + Koota ECS.
