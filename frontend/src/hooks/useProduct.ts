import { fetchProductById } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: !!id
  });
};