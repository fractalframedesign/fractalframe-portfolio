/** Pause after a wrong admin password; a separate module so tests can replace it */
export function loginDelay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
