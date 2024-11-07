import { Routes } from "@angular/router";
import { AdminComponent } from "./admin/admin.component";
import { AuthGuard } from "../../guards/auth.guard";
import { UserComponent } from "./user/user.component";

export const COMPANY_MANAGER: Routes = [
    {
        path: '',
        redirectTo: 'user',
        pathMatch: 'prefix'
    },
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    { path: 'user', component: UserComponent, canActivate: [AuthGuard] }
]