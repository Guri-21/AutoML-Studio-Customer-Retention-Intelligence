// Centralised API base URLs — driven by Vite env vars so they work
// in both local dev (localhost) and production (Render/Vercel URLs).
//
// In development  → falls back to localhost automatically
// In production   → set VITE_API_URL and VITE_ML_URL in Vercel dashboard

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
export const ML_URL  = import.meta.env.VITE_ML_URL  || 'http://localhost:8000';
