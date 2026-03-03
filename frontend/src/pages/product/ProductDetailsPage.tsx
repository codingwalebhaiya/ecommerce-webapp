import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { useProducts } from "@/hooks/useProducts";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { data, isLoading } = useProducts(id!);
  const addToCart = useCartStore((state) => state.addToCart);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>Product not found</p>;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <img
        src={data.image}
        alt={data.title}
        className="rounded-xl"
      />

      <div className="space-y-4">
        <h2 className="text-3xl font-bold">{data.title}</h2>
        <p className="text-muted-foreground">
          ${data.price}
        </p>

        <p>{data.description}</p>

        <Button
          onClick={() =>
            addToCart({
              productId: data._id,
              title: data.title,
              price: data.price,
              quantity: 1,
              image: data.image,
            })
          }
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
