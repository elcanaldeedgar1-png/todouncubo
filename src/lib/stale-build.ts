/**
 * Tras publicar una versión nueva de la web, una pestaña abierta desde antes puede pedir
 * archivos que ya no existen y fallar. Detectamos ese caso para recargar una sola vez.
 */
export function isStaleBuildError(error: Error) {
  const text = `${error.name} ${error.message}`;
  return /ChunkLoadError|Loading chunk|Loading CSS chunk|Failed to fetch dynamically imported module|Server Action .* was not found|Failed to find Server Action/i.test(text);
}

export function reloadOnceForStaleBuild() {
  const KEY = 'tuc-stale-reload';
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 30_000) return; // ya se recargó hace poco: no entrar en bucle
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Sin sessionStorage: recargamos igualmente una vez.
  }
  window.location.reload();
}
