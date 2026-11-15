export function loadDraft(storageProvider, fallbackFactory, migrate) {
  try {
    const storage = typeof storageProvider === 'function' ? storageProvider() : storageProvider;
    const raw = storage.getItem('registre_draft');
    if (!raw) return fallbackFactory();
    return migrate(JSON.parse(raw));
  } catch {
    return fallbackFactory();
  }
}
