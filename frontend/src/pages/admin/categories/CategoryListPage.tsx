import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Loader2, 
    Search,
    Image as ImageIcon,
    MoreHorizontal,
    Grid3X3,
    List,
    Filter,
    AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllCategories, useDeleteCategory } from "@/hooks/useCategory";
import { Category } from "@/types/category.types";

export default function CategoryListPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteName, setDeleteName] = useState<string>("");
    
    const { data: response, isLoading, isError, refetch } = useAllCategories();
    const deleteMutation = useDeleteCategory();
    
    const categories:Category[] = response?.data || [];
    //const categories: Category[] = Array.isArray(response) ? response : [];

    // Filter categories based on search
    const filteredCategories = categories.filter((category: any) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const activeCategories = categories.filter((c: any) => c.isActive !== false).length;
    const inactiveCategories = categories.filter((c: any) => c.isActive === false).length;

    // Handle delete
    const handleDelete = async (deleteId:string) => {
        if (!deleteId) return;
        
        try {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
            setDeleteName("");
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 w-full mb-2" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md w-full">
                    <CardContent className="py-12 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Failed to Load Categories</h2>
                        <p className="text-gray-500 mb-6">
                            There was an error loading the categories. Please try again.
                        </p>
                        <Button onClick={() => refetch()}>
                            <Loader2 className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Empty State
    if (categories.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md w-full">
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">📁</div>
                        <h2 className="text-2xl font-bold mb-2">No Categories Yet</h2>
                        <p className="text-gray-500 mb-6">
                            Create your first category to organize your products.
                        </p>
                        <Link to="/admin/categories/create">
                            <Button size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Create First Category
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your product categories and their settings
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                    >
                        {viewMode === "table" ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                    </Button>
                    <Link to="/admin/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {categories.length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            All categories in store
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {activeCategories}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Visible to customers
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-gray-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Inactive
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">
                            {inactiveCategories}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Hidden from customers
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search categories by name or slug..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {searchTerm && (
                    <Button 
                        variant="ghost" 
                        onClick={() => setSearchTerm("")}
                        className="text-gray-500"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Search Results Info */}
            {searchTerm && (
                <div className="text-sm text-gray-500">
                    Found {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} 
                    matching "{searchTerm}"
                </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category: any) => (
                        <Card 
                            key={category._id || category.id} 
                            className="hover:shadow-lg transition-shadow group cursor-pointer"
                            onClick={() => navigate(`/admin/categories/edit/${category._id || category.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <Avatar className="h-12 w-12 rounded-lg">
                                        <AvatarImage 
                                            src={category.image?.url || category.image?.categoryImageUrl} 
                                            alt={category.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600 font-medium">
                                            {getInitials(category.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/admin/categories/edit/${category._id || category.id}`);
                                            }}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                className="text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteId(category._id || category.id);
                                                    setDeleteName(category.name);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{category.slug}</p>
                                
                                <div className="flex items-center justify-between">
                                    <Badge variant={category.isActive !== false ? "default" : "secondary"}>
                                        {category.isActive !== false ? "Active" : "Inactive"}
                                    </Badge>
                                    <span className="text-xs text-gray-400">
                                        {category.productCount || 0} products
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle>
                            All Categories ({filteredCategories.length})
                        </CardTitle>
                        <CardDescription>
                            Click on a category row to edit it
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                                    <TableHead className="hidden sm:table-cell">Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category: any) => (
                                    <TableRow 
                                        key={category._id || category.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => navigate(`/admin/categories/edit/${category._id || category.id}`)}
                                    >
                                        <TableCell>
                                            <Avatar className="h-10 w-10 rounded-lg">
                                                <AvatarImage 
                                                    src={category.image?.url || category.image?.categoryImageUrl} 
                                                    alt={category.name}
                                                />
                                                <AvatarFallback className="rounded-lg bg-gray-100">
                                                    <ImageIcon className="h-5 w-5 text-gray-400" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{category.name}</p>
                                                <p className="text-xs text-gray-500 md:hidden">{category.slug}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-gray-500">
                                            {category.slug}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant="outline">
                                                {category.productCount || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={category.isActive !== false ? "default" : "secondary"}
                                                className="capitalize"
                                            >
                                                {category.isActive !== false ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                                            {new Date(category.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/categories/edit/${category._id || category.id}`);
                                                    }}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Category
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteId(category._id || category.id);
                                                            setDeleteName(category.name);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Category
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                
                                {filteredCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <Search className="h-12 w-12 text-gray-300" />
                                                <div>
                                                    <p className="text-gray-500 font-medium">No categories found</p>
                                                    <p className="text-sm text-gray-400">
                                                        Try adjusting your search terms
                                                    </p>
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => setSearchTerm("")}
                                                >
                                                    Clear Search
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => {
                setDeleteId(null);
                setDeleteName("");
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deleteName}</strong>? 
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        Products in this category will not be deleted but may become uncategorized.
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete(deleteId!)}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Category
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}