import { Routes } from "@angular/router";
import { AdminComponent } from "./admin/admin.component";
import { AuthGuard } from "../../guards/auth.guard";
import { UserComponent } from "./user/user.component";
import { RoleGuard } from "../../guards/role.guard";
import { Roles } from "../../enums/enums";
import { CompanyComponent } from "./components/company/company.component";
import { UsersComponent } from "./components/users/users.component";
import { CatalogsComponent } from "./components/catalogs/catalogs.component";

export const COMPANY_MANAGER: Routes = [
    {
        path: '',
        redirectTo: 'user',
        pathMatch: 'prefix'
    },
    { 
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {roles: [Roles.ADMIN]} 
    },
    { 
        path: 'user', 
        component: UserComponent, 
        canActivate: [AuthGuard, RoleGuard],
        data: {roles: [Roles.CATALOG_CUSTOMER, Roles.COMPANY_ADMIN, Roles.ADMIN]},
        children: [
            { path: '', redirectTo: 'company', pathMatch: 'full' },
            { path: 'company', component: CompanyComponent },
            { path: 'users', component: UsersComponent },
            { path: 'catalogs', component: CatalogsComponent }
        ]
    }
]