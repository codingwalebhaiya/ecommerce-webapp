// pages/admin/EditProductPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
    Loader2, 
    Upload, 
    X, 
    ArrowLeft,
    Image as ImageIcon,
    Plus,
    AlertCircle,
    CheckCircle2,
    Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateProduct, useUploadProductImages } from "@/hooks/useProducts";
import { useAllCategories } from "@/hooks/useCategory";
import { useProductById } from "@/hooks/useProducts"; // You'll need to create this

// Validation schema matching your backend model
const updateProductSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must not exceed 100 characters"),
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description must not exceed 2000 characters"),
    price: z.coerce
        .number()
        .min(0.01, "Price must be greater than 0")
        .multipleOf(0.01, "Price can have at most 2 decimal places"),
    stock: z.coerce
        .number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative"),
    category: z.string().min(1, "Please select a category"),
    brand: z.string().min(1, "Brand is required").max(100),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

type UpdateProductFormData = z.infer<typeof updateProductSchema>;

interface ExistingImage {
    productImageUrl: string;
    productImagePublicId: string;
}

export default function EditProductPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // API hooks
    const { data: productData, isLoading: productLoading } = useProductById(id!);
    const { data: categoriesData, isLoading: catLoading } = useAllCategories();
    const updateMutation = useUpdateProduct();
    const uploadMutation = useUploadProductImages();
    
    const categories = categoriesData?.data || [];
    const product = productData?.data;
    
    // Image states
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<UpdateProductFormData>({
        resolver: zodResolver(updateProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            category: "",
            brand: "",
            isFeatured: false,
            isActive: true,
        },
    });

    // Load product data
    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name || "",
                description: product.description || "",
                price: product.price || 0,
                stock: product.stock || 0,
                category: product.category?._id || product.category || "",
                brand: product.brand || "",
                isFeatured: product.isFeatured || false,
                isActive: product.isActive !== false,
            });
            
            // Set existing images
            if (product.images && product.images.length > 0) {
                setExistingImages(product.images);
            }
        }
    }, [product, form]);

    // Handle new file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Check total images (existing - removed + new)
        const currentExistingCount = existingImages.length - removedImageIds.length;
        const totalAfterAdd = currentExistingCount + newImageFiles.length + files.length;
        
        if (totalAfterAdd > 3) {
            form.setError("root", {
                message: `You can only have up to 3 images. Currently have ${currentExistingCount} existing and ${newImageFiles.length} new images.`
            });
            return;
        }

        const validFiles = files.filter(file => {
            if (!file.type.startsWith("image/")) {
                form.setError("root", { message: `${file.name} is not an image file` });
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                form.setError("root", { message: `${file.name} is larger than 5MB` });
                return false;
            }
            return true;
        });

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setNewImageFiles(prev => [...prev, ...validFiles]);
        setNewImagePreviews(prev => [...prev, ...newPreviews]);
        form.clearErrors("root");
    };

    // Remove existing image
    const removeExistingImage = (publicId: string) => {
        setRemovedImageIds(prev => [...prev, publicId]);
        setExistingImages(prev => prev.filter(img => img.productImagePublicId !== publicId));
    };

    // Remove new image
    const removeNewImage = (index: number) => {
        if (newImagePreviews[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(newImagePreviews[index]);
        }
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Submit form
    const onSubmit = async (data: UpdateProductFormData) => {
        try {
            setIsUploading(true);
            
            // Step 1: Upload new images if any
            let uploadedImages: ExistingImage[] = [];
            if (newImageFiles.length > 0) {
                const formData = new FormData();
                newImageFiles.forEach((file) => {
                    formData.append("images", file);
                });
                
                const uploadRes = await uploadMutation.mutateAsync(formData);
                // Handle response format
                uploadedImages = uploadRes.data?.images || uploadRes.images || uploadRes.data || [];
                
                // Ensure we have the correct format
                uploadedImages = uploadedImages.map((img: any) => ({
                    productImageUrl: img.productImageUrl || img.url,
                    productImagePublicId: img.productImagePublicId || img.publicId,
                }));
            }

            // Step 2: Prepare final images array
            const finalImages = [
                ...existingImages,
                ...uploadedImages,
            ];

            // Validate at least one image
            if (finalImages.length === 0) {
                form.setError("root", { message: "Product must have at least one image" });
                setIsUploading(false);
                return;
            }

            // Step 3: Update product
            const updateData = {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                category: data.category,
                brand: data.brand,
                isFeatured: data.isFeatured,
                isActive: data.isActive,
                images: finalImages,
                removedImageIds: removedImageIds, // Send to backend for Cloudinary cleanup
            };

            await updateMutation.mutateAsync({ 
                id: id!, 
                data: updateData 
            });
            
            // Navigation happens automatically via mutation onSuccess
            navigate("/admin/products");
            
        } catch (error: any) {
            console.error("Update failed:", error);
            // Error handled by mutation onError
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file input change for drag and drop or button click
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e);
    };

    const isPending = updateMutation.isPending || uploadMutation.isPending || isUploading;
    const totalImages = (existingImages.length - removedImageIds.length) + newImageFiles.length;

    // Loading state
    if (productLoading) {
        return (
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-32 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Back Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/admin/products")}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Products
                </button>
                <Badge variant="outline" className="text-xs">
                    ID: {id?.substring(0, 8)}...
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Product</CardTitle>
                    <CardDescription>
                        Update product details. Current images: {existingImages.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Product Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter product name" 
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Enter product description" 
                                                rows={5}
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {field.value?.length || 0}/2000 characters
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price & Stock Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price ($) *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0"
                                                    placeholder="0.00" 
                                                    {...field}
                                                    disabled={isPending}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="0"
                                                    placeholder="0" 
                                                    {...field}
                                                    disabled={isPending}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Category & Brand Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category *</FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                value={field.value}
                                                disabled={isPending || catLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {catLoading ? (
                                                        <div className="flex items-center justify-center p-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        categories?.map((cat: any) => (
                                                            <SelectItem 
                                                                key={cat._id || cat.id} 
                                                                value={cat._id || cat.id}
                                                            >
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter brand name" 
                                                    {...field}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Toggle Switches */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <FormLabel className="text-base">Featured Product</FormLabel>
                                                <FormDescription>
                                                    Show in featured section
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <FormLabel className="text-base">Active</FormLabel>
                                                <FormDescription>
                                                    Visible to customers
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Images Section */}
                            <div className="space-y-4">
                                <div>
                                    <FormLabel className="text-base">Product Images</FormLabel>
                                    <FormDescription>
                                        {totalImages}/3 images • You can add, remove, or replace images
                                    </FormDescription>
                                </div>

                                {/* Existing Images */}
                                {existingImages.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Current Images ({existingImages.length})
                                        </p>
                                        <div className="flex gap-4 flex-wrap">
                                            {existingImages.map((image, index) => (
                                                <div key={index} className="relative w-32 h-32 group">
                                                    <img
                                                        src={image.productImageUrl}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(image.productImagePublicId)}
                                                        disabled={isPending}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images */}
                                {newImagePreviews.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-blue-700 mb-2">
                                            New Images ({newImagePreviews.length})
                                        </p>
                                        <div className="flex gap-4 flex-wrap">
                                            {newImagePreviews.map((preview, index) => (
                                                <div key={index} className="relative w-32 h-32 group">
                                                    <img
                                                        src={preview}
                                                        alt={`New ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-lg border-2 border-blue-300"
                                                    />
                                                    <Badge 
                                                        className="absolute top-2 left-2 bg-blue-500 text-xs"
                                                    >
                                                        New
                                                    </Badge>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        disabled={isPending}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add More Images */}
                                {totalImages < 3 && (
                                    <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <Plus className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            Add Images ({totalImages}/3)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={onFileChange}
                                            disabled={isPending}
                                        />
                                    </label>
                                )}

                                {totalImages === 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-yellow-700">
                                            Product must have at least one image. Please add or keep existing images.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Form Error */}
                            {form.formState.errors.root && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700">
                                        {form.formState.errors.root.message}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/admin/products")}
                                    disabled={isPending}
                                    className="flex-1"
                                    size="lg"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isPending}
                                    className="flex-1"
                                    size="lg"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {uploadMutation.isPending 
                                                ? "Uploading Images..." 
                                                : "Updating..."}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Update Product
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}