export interface ProductType {
    _id: string;
    name: string;
    slug: string;
    sku: string;
  
    category?: {
      _id: string;
      name: string;
    };
  
    brand?: {
      _id: string;
      name: string;
    };
  
    import_price?: number;
    original_price: number;
    price: number;
  
    stock: number;
    sold: number;
  
    images: string[];
    description?: string;
  
    specs?: {
      k: string;
      v: string;
    }[];
  
    rating?: number;
    numReviews?: number;
  
    warranty_months: number;
  
    is_active: boolean;
  
    createdAt?: string;
    updatedAt?: string;
  }