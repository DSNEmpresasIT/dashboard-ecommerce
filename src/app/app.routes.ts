import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'prefix'
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent),
        title: 'Dashboard',
        canActivate: [AuthGuard]
    },
    {
        path: 'auth',
        loadComponent: () => import('./pages/auth/auth.component').then(c => c.AuthComponent),
        title: 'login'
    },
    {
        path: 'product-details',
        loadComponent: () => import('./pages/product-feature/product-feature.component').then(c => c.ProductFeatureComponent),
        title: 'Detalles del producto',
        canActivate: [AuthGuard]
    },
    { path: 'company-manager', loadChildren: () => import('./pages/company-manager/company-manager.routes').then(m => m.COMPANY_MANAGER) },
];
