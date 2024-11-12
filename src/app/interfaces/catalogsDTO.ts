import { CatalogType } from "../enums/enums";

export interface CategoryDTO{
  id: number;
  catalogId?: number;
  label: string;
  value?: string | null;
  fatherCategoryId?: number;
  isSubstanceActive?: boolean;
}

export interface CreateCatalogDTO {
  name:string,
  companyId:number,
  catalogType: CatalogType
}
