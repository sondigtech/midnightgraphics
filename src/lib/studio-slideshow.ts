export const STUDIO_SLIDE_INTERVAL_MS = 3000;
export function nextStudioSlide(current: number, count: number) {
  return count > 0 ? (current + 1) % count : 0;
}