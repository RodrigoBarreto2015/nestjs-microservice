const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const api = (p: string) => `${base}${p}`;