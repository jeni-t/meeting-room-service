export function isBusinessHours(start, end) {
  const day = start.getDay(); // 1–5 only (Mon-Fri)
  if (day === 0 || day === 6) return false;

  const sH = start.getHours();
  const eH = end.getHours();

  return sH >= 8 && eH <= 20;
}

export function durationOK(start, end) {
  const diff = (end - start) / (1000 * 60); // mins
  return diff >= 15 && diff <= 240;
}
