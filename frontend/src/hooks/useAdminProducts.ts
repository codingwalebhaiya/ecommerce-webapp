import { getAdminProducts } from "@/services/admin.service";
import { useQuery } from "@tanstack/react-query";

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
  });
};