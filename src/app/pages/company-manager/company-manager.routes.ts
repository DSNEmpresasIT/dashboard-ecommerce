import { Routes } from "@angular/router";
import { AdminComponent } from "./admin/admin.component";
import { AuthGuard } from "../../guards/auth.guard";
import { UserComponent } from "./user/user.component";
import { RoleGuard } from "../../guards/role.guard";
import { Roles } from "../../enums/enums";

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
        data: {roles: [Roles.CUSTOMER, Roles.PREMIUM, Roles.ADMIN]}
    }
]