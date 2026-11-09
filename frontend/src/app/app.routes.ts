import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/principal/principal').then((modulo) => modulo.Principal),
    },
    {
        path: 'login',
        loadComponent: () => import('./components/log-in/log-in').then((modulo) => modulo.LogIn),
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./components/register/register').then((modulo) => modulo.Register),
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./components/dashboard/dashboard-layout/dashboard-layout').then(
                (modulo) => modulo.DashboardLayout,
            ),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./components/dashboard/pages/inicio/inicio').then(
                        (modulo) => modulo.Inicio,
                    ),
            },
            {
                path: 'mascotas',
                loadComponent: () =>
                    import('./components/dashboard/pages/mascotas/mascotas').then(
                        (modulo) => modulo.Mascotas,
                    ),
            },
            {
                path: 'citas',
                loadComponent: () =>
                    import('./components/dashboard/pages/citas/citas').then(
                        (modulo) => modulo.Citas,
                    ),
            },
            {
                path: 'historial',
                loadComponent: () =>
                    import('./components/dashboard/pages/historial/historial').then(
                        (modulo) => modulo.Historial,
                    ),
            },
            {
                path: 'vacunas',
                loadComponent: () =>
                    import('./components/dashboard/pages/vacunas/vacunas').then(
                        (modulo) => modulo.Vacunas,
                    ),
            },
            {
                path: 'pagos',
                loadComponent: () =>
                    import('./components/dashboard/pages/pagos/pagos').then(
                        (modulo) => modulo.Pagos,
                    ),
            },
            {
                path: 'productos',
                loadComponent: () =>
                    import('./components/dashboard/pages/productos/productos').then(
                        (modulo) => modulo.Productos,
                    ),
            },
            {
                path: 'configuracion',
                loadComponent: () =>
                    import('./components/dashboard/pages/configuracion/configuracion').then(
                        (modulo) => modulo.Configuracion,
                    ),
            },
            { path: '**', redirectTo: '' },
        ],
    },
    // Compatibilidad con enlaces antiguos que apuntaban a rutas raíz.
    { path: 'mascotas', redirectTo: 'dashboard/mascotas' },
    { path: 'citas', redirectTo: 'dashboard/citas' },
    { path: 'historial', redirectTo: 'dashboard/historial' },
    { path: 'vacunas', redirectTo: 'dashboard/vacunas' },
    { path: 'pagos', redirectTo: 'dashboard/pagos' },
    { path: 'productos', redirectTo: 'dashboard/productos' },
    { path: 'configuracion', redirectTo: 'dashboard/configuracion' },
    { path: '**', redirectTo: '' },
];
