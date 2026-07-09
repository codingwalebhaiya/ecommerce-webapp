import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useAllCategories } from "@/hooks/useCategory";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Search,
    Package,
    Plus,
    Trash2,
    Edit,
    AlertCircle,
    Boxes,
    TrendingUp,
} from "lucide-react";


type CategoryType = {
    id: string;
    name: string;
    slug?: string;
    image?: {
        categoryImageUrl: string;
        categoryImagePublicId: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string | CategoryType;
    brand: string;
    slug: string;
    stock: number;
    isFeatured: boolean;
    isActive: boolean;
    images?: Array<{
        productImageUrl: string;
        productImagePublicId: string;
    }>;
    createdAt: string;
    updatedAt: string;
};

const ProductListPage = () => {
    const navigate = useNavigate();

    // Fetch product list using TanStack query hook
    const { data: responseData, isLoading, error } = useAllProducts();

    // Fetch categories for search filters
    const { data: categoriesData } = useAllCategories();

    // Deletion hook
    const deleteProductMutation = useDeleteProduct();

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Standard product payload is returned as select: data => data.data in hook but sometimes select wrapper is different,
    // let's safe-guard the product list extraction.
    const products: Product[] = Array.isArray(responseData) ? responseData : [];

    // Filter Logic
    const filteredProducts = products.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase());

        // category can be populated object or just id string
        let categoryId = "";
        if (typeof product.category === "object" && product.category !== null) {
            categoryId = (product.category as CategoryType).id;
        } else if (typeof product.category === "string") {
            categoryId = product.category;
        }

        const categoryMatch = categoryFilter === "all" || categoryId === categoryFilter;

        const statusMatch = statusFilter === "all" ||
            (statusFilter === "active" ? product.isActive : !product.isActive);

        let stockMatch = true;
        if (stockFilter === "out") {
            stockMatch = product.stock === 0;
        } else if (stockFilter === "low") {
            stockMatch = product.stock > 0 && product.stock <= 5;
        } else if (stockFilter === "in") {
            stockMatch = product.stock > 5;
        }

        return nameMatch && categoryMatch && statusMatch && stockMatch;
    });

    // Stats calculations
    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => p.stock <= 5 && p.stock > 0).length;
    const outOfStockProducts = products.filter((p) => p.stock === 0).length;
    const featuredProductsCount = products.filter((p) => p.isFeatured).length;

    // Handle delete action
    const handleDelete = async (productId: string, productName: string) => {
        if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                await deleteProductMutation.mutateAsync({ id: productId });
            } catch (err: any) {
                // error is already globally toasted by mutate hook, but we catch local reject
            }
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-150 p-8 shadow-xs">
                <AlertCircle className="h-12 w-12 text-destructive mb-4 animate-bounce" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to Load Products</h3>
                <p className="text-sm text-muted-foreground text-center">
                    {error.message || "An unexpected error occurred while fetching the product list."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products Directory</h1>
                    <p className="text-gray-500 mt-1">Manage and audit your e-commerce catalog, stock levels, pricing, and visibility status.</p>
                </div>
                <Button
                    onClick={() => navigate("/admin/products/create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs self-start md:self-center flex items-center gap-1.5"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : totalProducts}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-red-50 text-red-650 rounded-lg">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : outOfStockProducts}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Boxes className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Low Stock (≤5)</p>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : lowStockProducts}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Featured Items</p>
                        <p className="text-2xl font-bold text-gray-900">{isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : featuredProductsCount}</p>
                    </div>
                </div>
            </div>

            {/* Filtering tools header */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
                {/* Search query input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search products by name or brand..."
                        className="pl-9 bg-gray-50/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Category Filter */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</span>
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {Array.isArray(categoriesData) && categoriesData.map((cat: CategoryType) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stock filter */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</span>
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                        >
                            <option value="all">All Stock Status</option>
                            <option value="in">In Stock (&gt;5)</option>
                            <option value="low">Low Stock (1-5)</option>
                            <option value="out">Out of Stock (0)</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                        <select
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Visibility</option>
                            <option value="active">Active (Visible)</option>
                            <option value="inactive">Inactive (Hidden)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List products table container */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-6">Product</th>
                                <th className="py-4 px-6">Category</th>
                                <th className="py-4 px-6">Price</th>
                                <th className="py-4 px-6">Stock</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <Skeleton className="h-10 w-10 rounded-md" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <Skeleton className="h-4 w-12" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <Skeleton className="h-5 w-10" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <Skeleton className="h-5 w-14 rounded-full" />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Skeleton className="h-8 w-16 rounded-md" />
                                                <Skeleton className="h-2 w-8 rounded-md" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 px-6 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="h-12 w-12 text-gray-300 mb-2" />
                                            <p className="text-gray-500 font-medium">No products found</p>
                                            <p className="text-gray-400 text-sm mt-0.5">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const firstImage = product.images?.[0]?.productImageUrl || "";
                                    const categoryName = typeof product.category === "object" && product.category !== null
                                        ? (product.category as CategoryType).name
                                        : "Uncategorized";

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50/70 transition-colors group">
                                            {/* Product column */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-md bg-gray-50 overflow-hidden border border-gray-150 flex items-center justify-center flex-shrink-0">
                                                        {firstImage ? (
                                                            <img src={firstImage} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Package className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-0.5">
                                                            Brand: <span className="font-medium text-gray-650">{product.brand || "Generic"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category column */}
                                            <td className="py-4 px-6">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-gray-100 text-gray-700 border-gray-200 font-medium px-2.5 py-0.5"
                                                >
                                                    {categoryName}
                                                </Badge>
                                            </td>

                                            {/* Price column */}
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-bold text-gray-900">
                                                    ${product.price.toFixed(2)}
                                                </div>
                                            </td>

                                            {/* Stock column */}
                                            <td className="py-4 px-6">
                                                {product.stock === 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                                        Out of Stock
                                                    </span>
                                                ) : product.stock <= 5 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        Low ({product.stock})
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-700">
                                                        {product.stock}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status / Visibility column */}
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${product.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-gray-50 text-gray-500 border-gray-250"
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${product.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                                                    {product.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions column */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    {product.isFeatured && (
                                                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 p-1 font-semibold" title="Featured Product">
                                                            ★
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="shadow-none border-gray-200 hover:border-blue-400 hover:text-blue-600 bg-white"
                                                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                                                    >
                                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="shadow-none border-gray-200 hover:border-red-400 hover:text-red-650 bg-white text-destructive"
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
