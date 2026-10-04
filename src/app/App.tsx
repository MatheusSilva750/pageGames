import Game from '../game/Game';
import { useGameStore } from '../stores/gameStore';

const assetForUnit = {
  worker: '/assets/bees/worker-bee.webp',
  guard: '/assets/bees/guard-bee.webp',
} as const;

export default function App() {
  const resources = useGameStore((state) => state.resources);
  const speed = useGameStore((state) => state.speed);
  const units = useGameStore((state) => state.units);
  const selectedUnitIds = useGameStore((state) => state.selectedUnitIds);
  const enemies = useGameStore((state) => state.enemies);
  const elapsed = useGameStore((state) => state.elapsed);
  const waveTimer = useGameStore((state) => state.waveTimer);
  const message = useGameStore((state) => state.message);
  const buildMode = useGameStore((state) => state.buildMode);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const setBuildMode = useGameStore((state) => state.setBuildMode);
  const produceUnit = useGameStore((state) => state.produceUnit);
  const resetGame = useGameStore((state) => state.resetGame);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const populationCap = useGameStore((state) => state.populationCap);

  const selectedUnits = units.filter((unit) => selectedUnitIds.includes(unit.id));
  const primary = selectedUnits[0];

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <strong>HIVEFRONT</strong>
          <span>Colony RTS</span>
        </div>
        <div className="resources">
          <span>🍯 {Math.floor(resources.nectar)}</span>
          <span>🌸 {Math.floor(resources.pollen)}</span>
          <span>🐝 {units.length}/{populationCap}</span>
          <span>⚠ {enemies.length}</span>
        </div>
        <div className="top-actions">
          <span>{mm}:{ss}</span>
          <button onClick={() => setSpeed(speed === 1 ? 2 : 1)}>{speed}x</button>
          <button onClick={resetGame}>Reiniciar</button>
        </div>
      </header>

      <section className="playfield">
        <aside className="objectives">
          <h3>OBJETIVOS</h3>
          <label><input type="checkbox" readOnly checked={resources.nectar >= 500} /> Coletar 500 de néctar</label>
          <label><input type="checkbox" readOnly checked={units.length >= 12} /> Produzir 12 abelhas</label>
          <label><input type="checkbox" readOnly checked={enemies.length === 0 && elapsed > 25} /> Defender a colmeia</label>
          <div className="wave">Próxima onda: {Math.max(0, Math.ceil(waveTimer))}s</div>
        </aside>

        <Game />

        {buildMode && (
          <div className="build-hint">
            Clique no terreno para construir <strong>{buildMode}</strong>. ESC/cancelar: use o botão novamente.
          </div>
        )}
      </section>

      <footer className="command-panel">
        <section className="minimap">
          <div className="mini-grid">
            <i className="mini-base" />
            <i className="mini-resource one" />
            <i className="mini-resource two" />
            <i className="mini-resource three" />
            {enemies.length > 0 && <i className="mini-enemy" />}
          </div>
        </section>

        <section className="selection-card">
          {primary ? (
            <>
              <img src={assetForUnit[primary.type]} alt="" />
              <div>
                <strong>{primary.type === 'worker' ? 'Abelha Operária' : 'Abelha Guardiã'}</strong>
                <span>{selectedUnits.length > 1 ? `${selectedUnits.length} unidades selecionadas` : primary.state}</span>
                <div className="healthbar"><span style={{ width: `${(primary.health / primary.maxHealth) * 100}%` }} /></div>
                <small>Dano: {primary.damage} · Velocidade: {primary.speed.toFixed(1)} · Carga: {primary.cargo.toFixed(0)}/12</small>
              </div>
              <button className="clear-selection" onClick={clearSelection}>×</button>
            </>
          ) : (
            <div className="empty-selection">
              <strong>Nenhuma unidade selecionada</strong>
              <span>Clique em uma abelha. Shift+clique adiciona à seleção.</span>
            </div>
          )}
        </section>

        <section className="commands">
          <button onClick={() => produceUnit('worker')}>
            <img src="/assets/bees/worker-bee.webp" alt="" />
            <span>Operária</span><small>50 🍯</small>
          </button>
          <button onClick={() => produceUnit('guard')}>
            <img src="/assets/bees/guard-bee.webp" alt="" />
            <span>Guardiã</span><small>100 🍯</small>
          </button>
          <button className={buildMode === 'nursery' ? 'active' : ''} onClick={() => setBuildMode(buildMode === 'nursery' ? null : 'nursery')}>
            <img src="/assets/bees/hive.webp" alt="" />
            <span>Berçário</span><small>150 🍯</small>
          </button>
          <button className={buildMode === 'tower' ? 'active' : ''} onClick={() => setBuildMode(buildMode === 'tower' ? null : 'tower')}>
            <img src="/assets/bees/guard-bee.webp" alt="" />
            <span>Torre</span><small>125 🍯</small>
          </button>
          <button className={buildMode === 'depot' ? 'active' : ''} onClick={() => setBuildMode(buildMode === 'depot' ? null : 'depot')}>
            <img src="/assets/bees/nectar-resource.webp" alt="" />
            <span>Depósito</span><small>100 🍯</small>
          </button>
        </section>
      </footer>

      <div className="status-line">{message}</div>
    </main>
  );
}
