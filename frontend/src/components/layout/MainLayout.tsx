import { Link, Outlet } from "react-router-dom";
import { useCartStore } from "@/store/cart.store";

export default function MainLayout() {
  const cartCount = useCartStore((state) => state.items.length);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-xl font-bold">
            MyStore
          </Link>

          <nav className="flex gap-6">
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart ({cartCount})</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto flex-1 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t text-center p-4 text-sm">
        © 2026 MyStore
      </footer>
    </div>
  );
}
