import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";


export default function ProductListPage() {
  const { data, isLoading , isError} = useProducts();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading products</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        All Products
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {data?.map((product: any) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
