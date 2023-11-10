import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: ()=> import('./pages/home/home.component').then(c => c.HomeComponent),
        title: 'adminDashBoard',
        canActivate: [AuthGuard]
    },
    {
        path: 'auth',
        loadComponent: ()=> import('./pages/auth/auth.component').then(c => c.AuthComponent),
        title: 'login'
    }

];
