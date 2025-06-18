// utils/playErrorSound.js
export function playErrorSound() {
  const audio = new Audio('/error-sound.mp3');
  audio.play().catch((e) => console.error('Sound error:', e));
}
