import { useAdminProducts } from "@/hooks/useAdminProducts";
import { Link } from "react-router-dom";

const AdminProducts = () => {
  const { data, isLoading } = useAdminProducts();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Products</h1>
        <Link
          to="/admin/products/create"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create Product
        </Link>
      </div>

      {data?.map((product) => (
        <div
          key={product._id}
          className="flex justify-between border p-3 mb-2"
        >
          <span>{product.name}</span>
          <Link to={`/admin/products/${product._id}/edit`}>
            Edit
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AdminProducts;