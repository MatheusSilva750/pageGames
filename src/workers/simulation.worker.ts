export interface SimulationTickMessage {
  type: 'tick';
  delta: number;
}

self.onmessage = (event: MessageEvent<SimulationTickMessage>) => {
  if (event.data.type !== 'tick') return;

  self.postMessage({
    type: 'tick-complete',
    delta: event.data.delta,
  });
};
