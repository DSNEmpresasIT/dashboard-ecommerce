export interface CategoryDTO{
  catalogId: number;
  label: string;
  value: string;
  fatherCategoryId?: number;
  isSubstanceActive?: boolean;
}