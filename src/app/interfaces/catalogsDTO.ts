export interface CategoryDTO{
  id: number;
  catalogId?: number;
  label: string;
  value?: string | null;
  fatherCategoryId?: number;
  isSubstanceActive?: boolean;
}