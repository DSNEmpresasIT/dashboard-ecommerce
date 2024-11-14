import { CrudAction } from "../enums/enums"
import { User } from "../pages/company-manager/user/user.component"
import { CreateCompanyDto } from "./companyDTO"
import { Catalog } from "./product"

export interface Data {
    user?: User
    action: CrudAction
}

export interface CatalogFormData extends Data{
    catalog?: Catalog
}

export interface CompanyFormData extends Data {
    company?: CreateCompanyDto
}
