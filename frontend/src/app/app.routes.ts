import { Routes } from '@angular/router';
import { Principal } from './components/principal/principal';
import { LogIn } from './components/log-in/log-in';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', component: Principal },
    { path: 'login', component: LogIn },
    { path: 'register', component: Register },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: '**', redirectTo: '' },
];
