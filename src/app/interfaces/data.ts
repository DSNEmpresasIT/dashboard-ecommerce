import { CrudAction } from "../enums/enums"
import { User } from "../pages/company-manager/user/user.component"
import { Company } from "./company"
import { CreateCompanyDto } from "./companyDTO"
import { Catalog } from "./product"

export interface Data {
    user?: User
    action: CrudAction,
    refresh: () => Promise<void>,
    company?: Company
}

export interface CatalogFormData extends Data{
    catalog?: Catalog
}

export interface CompanyFormData extends Data {
    companyDTO?: CreateCompanyDto
}
