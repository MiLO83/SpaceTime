export function observe(mode, distance, speed, year = 2026) {
  if (!(distance > 0) || !(speed > 0 && speed < 1)) throw new RangeError('Positive distance and a speed between 0 and 1c are required.');
  const arrival = mode === 'launch' ? year + distance / speed : year;
  const seen = mode === 'mirror' ? year - 2 * distance : arrival - distance;
  const received = mode === 'mirror' ? year : arrival + distance;
  return { arrival, seen, received, apertureKm: 1.22 * 550e-9 * distance * 9.4607304725808e15 / 1000 / 1000 };
}
