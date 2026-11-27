export const inputPreviewDuration = 1200;

export const frameDuration = (note: string, last: boolean) =>
  Math.min(5200, Math.max(3000, 2300 + note.length * 27)) + (last ? 1000 : 0);

export const nextFrame = (current: number, length: number) => (current + 1) % length;

export const shouldPlay = (requested: boolean, visible: boolean, pageVisible: boolean) =>
  requested && visible && pageVisible;
