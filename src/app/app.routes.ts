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
        title: 'Dashboard',
        canActivate: [AuthGuard]
    },
    {
        path: 'auth',
        loadComponent: ()=> import('./pages/auth/auth.component').then(c => c.AuthComponent),
        title: 'login'
    },
    {
        path: 'product-details',
        loadComponent: ()=> import('./pages/product-feature/product-feature.component').then(c => c.ProductFeatureComponent),
        title: 'Detalles del producto',
        canActivate: [AuthGuard]
    }

];
