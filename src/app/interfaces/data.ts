import { CrudAction } from "../enums/enums"
import { User } from "../pages/company-manager/user/user.component"
import { Company } from "./company"
import { CloudinaryDto, CreateCompanyDto, CreateContactInfo, CreateSocialMedia, EmailDto } from "./companyDTO"
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
    companyDTO?: CreateCompanyDto;
    
}

export interface Keys {
    cloudinary_keys?: CloudinaryDto;
    email_keys?: EmailDto;
    contact_info?: CreateContactInfo;
    links?: CreateSocialMedia;
}