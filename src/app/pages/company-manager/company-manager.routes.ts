import { Routes } from "@angular/router";
import { AdminComponent } from "./admin/admin.component";
import { AuthGuard } from "../../guards/auth.guard";

export const COMPANY_MANAGER: Routes = [
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
]