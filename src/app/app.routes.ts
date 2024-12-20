import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'company-manager',
        pathMatch: 'prefix'
    },
    {
        path: 'catalog',
        loadComponent: () => import('./pages/catalog/catalog.component').then(c => c.CatalogComponent),
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
    { 
        path: 'company-manager',
        loadChildren: () => import('./pages/company-manager/company-manager.routes').then(m => m.COMPANY_MANAGER),
        title:'Company',
        canActivate:[AuthGuard]
    },
    {
      path: 'access-denied',
      loadComponent: () => import('./pages/access-denied/access-denied.component').then((c)=> c.AccessDeniedComponent),
      title: 'Acceso denegado',
    }
];
