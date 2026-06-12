export async function safeQuery<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("Datenbankabfrage fehlgeschlagen:", error);
    return null;
  }
}
