import { expect, test } from "bun:test";
import { STUDIO_SLIDE_INTERVAL_MS, nextStudioSlide } from "./studio-slideshow.ts";
test("studio backgrounds change every three seconds", () => {
  expect(STUDIO_SLIDE_INTERVAL_MS).toBe(3000);
});
test("three studio backgrounds loop back to the first", () => {
  expect(nextStudioSlide(0, 3)).toBe(1);
  expect(nextStudioSlide(1, 3)).toBe(2);
  expect(nextStudioSlide(2, 3)).toBe(0);
});