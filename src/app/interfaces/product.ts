export interface Product {
    id: number;
    name?: string | null;
    description: string;
    brand?: string | null;
    stock?: number | null;
    code?: string  | null;
    formulacion?: string | null;
    images: image[];
    created_at: Date;
    is_active_substance?: boolean | null;
    supplier?: {
        name: string;
      } | null;
    supplier_id: number | undefined;
}

export interface image {
    id: number,
    created_at: string,
    is_active: boolean,
    deactivated_at: Date,
    cloudinary_id: number,
    url: string
}

export interface Category {
    id: number;
    label: string;
    value?: string | null;
    created_at: Date;
    father_category?: number;
    is_substance_active?: boolean;
    childrens?: Category[]
}

export interface selecdedCategories{
    category: Category[] | null
    subCategory: Category[] | null
}

export interface selectedCategory {
    category: Category | null,
    subCategory: Category | null
}