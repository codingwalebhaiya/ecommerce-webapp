import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/admin.service";
import ProductForm from "@/components/product/ProductForm";

const AdminEditProduct = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Edit Product</h1>
      <ProductForm {...({ defaultValues: data } as any)} />
    </div>
  );
};

export default AdminEditProduct;