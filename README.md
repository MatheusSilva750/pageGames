# pageGames

Base técnica de um tower defense 3D de colônia de insetos para web.

## Stack

- React 19 + TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Koota ECS
- Rapier
- Howler.js
- Vitest
- ESLint + Prettier

## Arquitetura

```text
src/
├── app/                 # composição da aplicação
├── game/
│   ├── ecs/             # world e componentes de simulação
│   ├── map/             # grid, pathfinding e flow fields
│   └── rendering/       # renderização Three/R3F
├── stores/              # estado global/UI com Zustand
├── workers/             # simulação pesada fora da main thread
└── styles.css
```

A ideia é manter React responsável por UI e composição, enquanto a simulação evolui separadamente no ECS. Rendering de grandes quantidades de unidades usa instancing.

## Rodando

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run build
npm test
npm run lint
npm run format
```

## Próximos passos

1. Transformar Position/Velocity/Health em traits do Koota e criar systems de movimento, targeting e combate.
2. Implementar flow field compartilhado para grandes enxames.
3. Introduzir object pooling para projéteis e efeitos.
4. Integrar Web Worker à simulação.
5. Adicionar carregamento de GLB com Meshopt/Draco/KTX2.
6. Adicionar áudio e grupos de volume com Howler.
