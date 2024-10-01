export interface Product {
    id: number;
    name?: string | null;
    brand?: string | null;
    stock?: number | null;
    code?: string  | null;
    formulacion?: string | null;
    img?: string | null;
    created_at: Date;
    is_active_substance?: boolean | null;
    supplier?: {
        name: string;
      } | null;
    supplier_id: number | undefined;
    is_highlighted: boolean;
}

export interface Category {
    id: number;
    category?: string | null;
    created_at: Date;
    father_category?: number;
    is_substance_active?: boolean;
}

export interface selecdedCategories{
    category: Category[] | null
    subCategory: Category[] | null
}

export interface selectedCategory {
    category: Category | null,
    subCategory: Category | null
}