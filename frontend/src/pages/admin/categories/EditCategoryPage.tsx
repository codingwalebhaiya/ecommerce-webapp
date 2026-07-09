// pages/admin/EditCategoryPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAllCategories, useUpdateCategory, useUploadCategoryImage } from "@/hooks/useCategory";

// Zod schema for form validation
const updateCategorySchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must not exceed 50 characters"),
    isActive: z.boolean().default(true),
});

type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

export default function EditCategoryPage() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    
    // Image states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [existingImage, setExistingImage] = useState<{
        url: string;
        publicId: string;
    } | null>(null);
    const [isRemovedImage, setIsRemovedImage] = useState(false);

    // Loading states
    const [isLoadingCategory, setIsLoadingCategory] = useState(true);

    // Mutations
    const uploadImageMutation = useUploadCategoryImage();
    const updateCategoryMutation = useUpdateCategory();
    
    // Fetch all categories to find current one
    const { data: response, isLoading: isCategoriesLoading } = useAllCategories();
    const categories = response?.data || [];
    const currentCategory = categories.find((c: any) => c._id === categoryId || c.id === categoryId);

    const form = useForm<UpdateCategoryFormData>({
        resolver: zodResolver(updateCategorySchema),
        defaultValues: {
            name: "",
            isActive: true,
        },
    });

    // Load category data when available
    useEffect(() => {
        if (currentCategory) {
            // Set form values
            form.reset({
                name: currentCategory.name || "",
                isActive: currentCategory.isActive !== false, // Default to true if undefined
            });
            
            // Set image - handle both naming conventions
            if (currentCategory.image) {
                const imageUrl = currentCategory.image.url || 
                                currentCategory.image.categoryImageUrl || "";
                const imagePublicId = currentCategory.image.publicId || 
                                     currentCategory.image.categoryImagePublicId || "";
                
                if (imageUrl) {
                    setExistingImage({
                        url: imageUrl,
                        publicId: imagePublicId,
                    });
                    setImagePreview(imageUrl);
                }
            }
            
            setIsLoadingCategory(false);
        }
    }, [currentCategory, form]);

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file (PNG, JPG, WebP)");
            return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }
        
        // Clean up old preview URL
        if (imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setExistingImage(null); // Will be replaced after upload
        setIsRemovedImage(false);
    };

    // Remove image completely
    const removeImage = () => {
        if (imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview("");
        setExistingImage(null);
        setIsRemovedImage(true);
    };

    // Upload new image to Cloudinary
    const handleUploadImage = async () => {
        if (!imageFile) {
            toast.error("Please select an image first");
            return;
        }
        
        try {
            const result = await uploadImageMutation.mutateAsync(imageFile);
            
            // Handle both response formats
            const uploadedImageData = result.data || result;
            const imageUrl = uploadedImageData.url || uploadedImageData.productImageUrl;
            const imagePublicId = uploadedImageData.publicId || uploadedImageData.productImagePublicId;
            
            setExistingImage({
                url: imageUrl,
                publicId: imagePublicId,
            });
            setImageFile(null);
            toast.success("Image uploaded successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload image");
        }
    };

    // Submit form
    const onSubmit = async (data: UpdateCategoryFormData) => {
        try {
            // Case 1: New image selected but not uploaded - Upload first
            let finalImage = existingImage;
            if (imageFile && !existingImage) {
                try {
                    const result = await uploadImageMutation.mutateAsync(imageFile);
                    const uploadedImageData = result.data || result;
                    finalImage = {
                        url: uploadedImageData.url || uploadedImageData.productImageUrl,
                        publicId: uploadedImageData.publicId || uploadedImageData.productImagePublicId,
                    };
                } catch (error) {
                    toast.error("Failed to upload image. Please try again.");
                    return;
                }
            }

            // Case 2: Image was removed
            if (isRemovedImage) {
                finalImage = null;
            }

            // Prepare update data matching backend model structure
            const updateData: any = {
                name: data.name,
                isActive: data.isActive,
            };

            // Only include image if it exists or was explicitly removed
            if (finalImage) {
                // Match your backend model structure: { categoryImageUrl, categoryImagePublicId }
                // OR generic: { url, publicId } depending on your model
                updateData.image = {
                    categoryImageUrl: finalImage.url,
                    categoryImagePublicId: finalImage.publicId,
                };
            } else if (isRemovedImage) {
                updateData.image = null; // Remove image
            }

            await updateCategoryMutation.mutateAsync({
                id: categoryId!,
                data: updateData,
            });
            
            navigate("/admin/categories");
        } catch (error) {
            console.error("Failed to update category:", error);
        }
    };

    const isPending = updateCategoryMutation.isPending || uploadImageMutation.isPending;

    // Loading state
    if (isLoadingCategory || isCategoriesLoading) {
        return (
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-48 w-48" />
                        <div className="flex gap-4">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 flex-1" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Category not found
    if (!currentCategory) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
                        <p className="text-gray-500 mb-6">
                            The category you're trying to edit doesn't exist or has been deleted.
                        </p>
                        <Button onClick={() => navigate("/admin/categories")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Breadcrumb / Back Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/admin/categories")}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Categories
                </button>
                <Badge variant="outline" className="text-xs">
                    ID: {categoryId?.substring(0, 8)}...
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Category</CardTitle>
                    <CardDescription>
                        Update the category details and image
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Category Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="e.g., Electronics, Fashion, Books" 
                                                {...field} 
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Slug will be auto-generated: {field.value 
                                                ? field.value.toLowerCase().replace(/\s+/g, '-') 
                                                : 'category-name'}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Active Status */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Active Status
                                            </FormLabel>
                                            <FormDescription>
                                                {field.value 
                                                    ? "Category is visible to customers" 
                                                    : "Category is hidden from customers"}
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

                            {/* Image Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Category Image</Label>
                                    {(imagePreview || existingImage) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeImage}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={isPending}
                                        >
                                            <X className="mr-1 h-4 w-4" />
                                            Remove Image
                                        </Button>
                                    )}
                                </div>

                                {/* Image Preview */}
                                {imagePreview ? (
                                    <div className="relative w-48 h-48 group">
                                        <img
                                            src={imagePreview}
                                            alt="Category preview"
                                            className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                                        {existingImage && (
                                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                ✓ Current Image
                                            </div>
                                        )}
                                        {imageFile && !existingImage && (
                                            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                                ⚠ Not uploaded
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <ImageIcon className="h-12 w-12 text-gray-400" />
                                        <span className="mt-2 text-sm text-gray-500">
                                            {isRemovedImage ? "Add New Image" : "Click to add image"}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, WebP (max 5MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                            disabled={isPending}
                                        />
                                    </label>
                                )}

                                {/* Upload button for new image */}
                                {imageFile && !existingImage && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleUploadImage}
                                        disabled={uploadImageMutation.isPending}
                                        className="w-full sm:w-auto"
                                    >
                                        {uploadImageMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Image to Cloudinary
                                            </>
                                        )}
                                    </Button>
                                )}

                                <FormDescription>
                                    Recommended size: 400x400 pixels. This image will be displayed in category navigation and product filters.
                                </FormDescription>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/admin/categories")}
                                    disabled={isPending}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isPending}
                                    className="flex-1"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {updateCategoryMutation.isPending 
                                                ? "Updating..." 
                                                : "Uploading..."}
                                        </>
                                    ) : (
                                        "Update Category"
                                    )}
                                </Button>
                            </div>

                            {/* Show error if any */}
                            {updateCategoryMutation.isError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    Failed to update category. Please try again.
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Category Info Card */}
            <Card className="bg-gray-50">
                <CardContent className="py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="ml-2 font-medium">
                                {new Date(currentCategory.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Last Updated:</span>
                            <span className="ml-2 font-medium">
                                {new Date(currentCategory.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Products:</span>
                            <span className="ml-2 font-medium">
                                {currentCategory.productCount || 0}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <Badge 
                                variant={currentCategory.isActive !== false ? "default" : "secondary"}
                                className="ml-2"
                            >
                                {currentCategory.isActive !== false ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}