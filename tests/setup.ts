 
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('Lit is in dev mode')) return;
    if (args[0].includes('[sf-icon]')) return;
  }
  originalWarn(...args);
};
