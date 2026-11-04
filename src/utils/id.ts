/** Robust unique id: works even when crypto.randomUUID is unavailable (insecure origins). */
export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `id-${time}-${random}`;
}
