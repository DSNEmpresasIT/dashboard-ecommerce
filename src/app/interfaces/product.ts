export interface Product {
    id: number;
    name?: string | null;
    description: string;
    brand?: string | null;
    stock?: number | null;
    code?: string | null;
    formulacion?: string | null;
    images: image[]; // Array de imágenes no opcional, pero puede estar vacío
    created_at: Date;
    is_active_substance?: boolean | null;
    supplier?: {
      name: string;
    } | null;
    supplier_id?: number | null; // Definido o null si no existe
    categories?: Category[]; // Array de categorías, opcional
    catalog?: Catalog | null; // Catálogo puede ser null
    product_features?: ProductFeatures | null; // Características del producto opcional
    relatedCategoriesMarked?:Category[]
  }
  
  export interface ProductFeatures {
    id: number;
    created_at: Date;
    is_active: boolean;
    deactivated_at?: Date | null;
    catalogType?: string | null;
    feature_text?: string | null;
    pdffiles?: string | null;
    items: FeatureItem[]; 
    specs: string[]; 
  }
  
  export interface Catalog {
    id: number;
    created_at: Date;
    is_active: boolean;
    deactivated_at?: Date | null;
    name: string;
    catalogType?: string | null;
  }
  
  
  export interface FeatureItem {
    title: string;
    text: string;
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
    created_at?: Date;
    parentId?: number;
    is_substance_active?: boolean;
    childrens?: Category[]
    selected?: boolean;
}

export interface selecdedCategories{
    category: Category[] | null
    subCategory: Category[] | null
}

export interface selectedCategory {
    category: Category | null,
    subCategory: Category | null
}