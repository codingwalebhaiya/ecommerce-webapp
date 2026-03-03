import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/services/product.service";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};


