import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-black text-white p-5 space-y-4">
      <h2 className="text-xl font-bold">Admin Panel</h2>

      <Link to="/admin">Dashboard</Link>
      <Link to="/admin/products">Products</Link>
      <Link to="/admin/orders">Orders</Link>
      <Link to="/admin/users">Users</Link>
    </aside>
  );
};

export default AdminSidebar;