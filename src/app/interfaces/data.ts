import { CrudAction } from "../enums/enums"
import { User } from "../pages/company-manager/user/user.component"
import { Catalog } from "./product"

export interface Data {
    user?: User
    action: CrudAction
}

export interface CatalogFormData extends Data{
    catalog?: Catalog
}