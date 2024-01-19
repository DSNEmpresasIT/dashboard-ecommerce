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
}

export interface Category {
    id: number;
    category?: string | null;
    created_at: Date;
}