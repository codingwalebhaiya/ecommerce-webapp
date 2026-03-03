import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";

interface Props {
  product: any;
}

export default function ProductCard({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="border rounded-xl p-4 shadow-sm space-y-3">
      <img
        src={product.image}
        alt={product.title}
        className="h-40 w-full object-cover rounded-md"
      />

      <h3 className="font-semibold">{product.title}</h3>

      <p className="text-muted-foreground">${product.price}</p>

      <div className="flex justify-between">
        <Link to={`/products/${product._id}`}>
          <Button variant="outline">View</Button>
        </Link>

        <Button
          onClick={() =>
            addToCart({
              productId: product._id,
              title: product.title,
              price: product.price,
              quantity: 1,
              image: product.image,
            })
          }
        >
          Add
        </Button>
      </div>
    </div>
  );
}
