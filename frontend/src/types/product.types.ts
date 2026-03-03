export interface ProductImageType {
    public_id:string;
    secure_url:string
}


// defining API response types
export interface ProductType {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: string;
  stock: number;
  images: ProductImageType[];
  createdAt: string;
  updatedAt: string;
}

// defining input types for creating/updating products
export interface CreateProductType {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: string;
  stock: number;
  images: ProductImageType[];

}