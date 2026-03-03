import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold">
        Welcome to MyStore
      </h1>

      <p className="text-muted-foreground">
        Buy amazing products at best prices
      </p>

      <Link to="/products">
        <Button>Browse Products</Button>
      </Link>

      <div className="flex items-center justify-center mt-6 space-x-4">

        <div className="space-x-4">
           <Link to="/login">
        <Button className="bg-red-500 hover:bg-red-600">Login</Button>
      </Link>
        </div>

       
<div className="space-x-4">
   <Link to="/register">
        <Button className="bg-green-500 hover:bg-green-600">Register</Button>
      </Link>
</div>
     
      </div>

      
    </div>
  );
}
