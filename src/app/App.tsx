import Game from '../game/Game';
import { useGameStore } from '../stores/gameStore';

export default function App() {
  const resources = useGameStore((state) => state.resources);
  const speed = useGameStore((state) => state.speed);
  const setSpeed = useGameStore((state) => state.setSpeed);

  return (
    <main className="app-shell">
      <header className="hud">
        <div>
          <strong>pageGames</strong>
          <span> Tower Defense de Colônia</span>
        </div>
        <div className="hud-actions">
          <span>Recursos: {resources}</span>
          <button onClick={() => setSpeed(speed === 1 ? 2 : 1)}>Velocidade: {speed}x</button>
        </div>
      </header>
      <Game />
    </main>
  );
}
