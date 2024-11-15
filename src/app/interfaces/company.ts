import { User } from "../pages/company-manager/user/user.component";
import { Catalog } from "./product";

export interface Company {
    id: number;
    logo: string | null;
    company_name: string,
    catalogs: Catalog[],
    users: User[],
    projects: Project[],
    project_types: ProjectType[],
    keys: CompanyKeys[],
    activeTab?: string
}

export interface Project {
    title: string;
    type: string | undefined;
    description: string;
    projectClient?: string;
    project_date?: string;
    imageUrl: string[] | ImageUrl[];
}
export interface ImageUrl {
    url: string;
    id: string;
}

export interface ProjectType {
    id: number,
    label: string,
    value: string,
    companyId: number
}

export interface CompanyKeys {
    id: number;
    supabaseUrl?: string;
    supabaseKey?: string;
    company: Company;
    instagram_key?: string;
    recaptcha_keys: ReCaptchaKey;
    email_keys: EmailKeys[];
    cloudinary_keys?: CloudinaryKeys;
}
export interface EmailKeys {
    id: number;
    host?: string;
    user?: string;
    port?: number;
    email?: string;
    password?: string;
}

export interface ReCaptchaKey {
    id: number;
    key?: string;
    secret_key?: string;
}

export interface CloudinaryKeys {
    id: number;
    cloud_name?: string;
    api_key?: string;
    api_secret?: string;
}
