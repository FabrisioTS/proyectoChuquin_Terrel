import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Los portales privados dependen de la sesión (token en el navegador),
    // por eso se renderizan en el cliente y no se prerenderizan.
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'veterinario',
    renderMode: RenderMode.Client,
  },
  {
    path: 'veterinario/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
