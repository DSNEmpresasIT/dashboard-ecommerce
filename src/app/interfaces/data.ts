import { CrudAction } from "../enums/enums"
import { User } from "../pages/company-manager/user/user.component"

export interface Data {
    user?: User
    action: CrudAction
}