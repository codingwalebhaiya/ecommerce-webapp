import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
    Loader2, 
    Upload, 
    X, 
    ArrowLeft, 
    Image as ImageIcon,
    Info,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCreateCategory, useUploadCategoryImage } from "@/hooks/useCategory";

// Step 1: Define the form schema
const createCategorySchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must not exceed 50 characters")
        .refine(
            (value) => value.trim().length > 0,
            "Name cannot be empty or just spaces"
        ),
    isActive: z.boolean().default(true),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export default function CreateCategoryPage() {
    const navigate = useNavigate();
    
    // Image states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploadedImage, setUploadedImage] = useState<{
        url: string;
        publicId: string;
    } | null>(null);
    const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [dragActive, setDragActive] = useState(false);

    // Mutations
    const uploadImageMutation = useUploadCategoryImage();
    const createCategoryMutation = useCreateCategory();

    const form = useForm<CreateCategoryFormData>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            name: "",
            isActive: true,
        },
    });

    // Watch name for live slug preview
    const watchedName = form.watch("name");

    // Generate slug preview
    const slugPreview = watchedName
        ? watchedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : 'category-name';

    // Handle drag events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle file drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    // Validate and set file
    const validateAndSetFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            form.setError("root", {
                message: "Please select a valid image file (PNG, JPG, WebP, GIF)"
            });
            return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            form.setError("root", {
                message: "Image size must be less than 5MB"
            });
            return;
        }
        
        // Clean up old preview URL
        if (imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setUploadedImage(null);
        setUploadProgress("idle");
        form.clearErrors("root");
    };

    // Remove image
    const removeImage = () => {
        if (imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview("");
        setUploadedImage(null);
        setUploadProgress("idle");
    };

    // Upload image to Cloudinary
    const handleUploadImage = async () => {
        if (!imageFile) {
            form.setError("root", { message: "Please select an image first" });
            return;
        }
        
        setUploadProgress("uploading");
        
        try {
            const result = await uploadImageMutation.mutateAsync(imageFile);
            
            // Handle both response formats
            const uploadedImageData = result.data || result;
            const imageUrl = uploadedImageData.url || uploadedImageData.productImageUrl;
            const imagePublicId = uploadedImageData.publicId || uploadedImageData.productImagePublicId;
            
            setUploadedImage({
                url: imageUrl,
                publicId: imagePublicId,
            });
            setUploadProgress("success");
            
            // Reset upload progress after 2 seconds
            setTimeout(() => {
                if (uploadProgress === "success") {
                    setUploadProgress("idle");
                }
            }, 2000);
            
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadProgress("error");
            form.setError("root", { message: "Failed to upload image. Please try again." });
        }
    };

    // Submit form
    const onSubmit = async (data: CreateCategoryFormData) => {
        // Upload image first if selected but not uploaded
        let finalImage = uploadedImage;
        
        if (imageFile && !uploadedImage) {
            setUploadProgress("uploading");
            try {
                const result = await uploadImageMutation.mutateAsync(imageFile);
                const uploadedImageData = result.data || result;
                finalImage = {
                    url: uploadedImageData.url || uploadedImageData.productImageUrl,
                    publicId: uploadedImageData.publicId || uploadedImageData.productImagePublicId,
                };
                setUploadProgress("success");
            } catch (error) {
                setUploadProgress("error");
                form.setError("root", { message: "Failed to upload image. Please try again." });
                return;
            }
        }

        // Prepare category data
        const categoryData: any = {
            name: data.name.trim(),
            isActive: data.isActive,
        };

        // Add image if uploaded
        if (finalImage) {
            categoryData.image = {
                categoryImageUrl: finalImage.url,
                categoryImagePublicId: finalImage.publicId,
            };
        }

        try {
            await createCategoryMutation.mutateAsync(categoryData);
            // Navigation will happen automatically due to onSuccess in mutation
            navigate("/admin/categories");
        } catch (error) {
            console.error("Failed to create category:", error);
        }
    };

    const isPending = createCategoryMutation.isPending || uploadImageMutation.isPending;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Back Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/admin/categories")}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Categories
                </button>
                <Badge variant="outline" className="text-xs">
                    New Category
                </Badge>
            </div>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Category</CardTitle>
                    <CardDescription>
                        Add a new category to organize your products. Categories help customers find products easily.
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
                                        <FormLabel className="text-base">
                                            Category Name <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="e.g., Electronics, Fashion, Home & Garden" 
                                                {...field} 
                                                disabled={isPending}
                                                autoFocus
                                                className="text-lg"
                                            />
                                        </FormControl>
                                        <div className="space-y-2">
                                            {/* Slug Preview */}
                                            {field.value && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-md">
                                                    <Info className="h-4 w-4" />
                                                    <span>URL Slug:</span>
                                                    <code className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-mono">
                                                        /category/{slugPreview}
                                                    </code>
                                                </div>
                                            )}
                                            <FormDescription>
                                                Choose a unique, descriptive name. Slug will be auto-generated from the name.
                                            </FormDescription>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Active Status */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base cursor-pointer">
                                                Active Status
                                            </FormLabel>
                                            <FormDescription>
                                                {field.value 
                                                    ? "Category will be visible to customers immediately" 
                                                    : "Category will be hidden until you activate it"}
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

                            <Separator />

                            {/* Image Section */}
                            <div className="space-y-3">
                                <div>
                                    <FormLabel className="text-base">
                                        Category Image
                                    </FormLabel>
                                    <FormDescription className="mt-1">
                                        Optional. Upload a representative image for this category.
                                    </FormDescription>
                                </div>

                                {/* Image Preview Area */}
                                <div className="flex flex-col items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <div className="relative w-64 h-64 group">
                                                <img
                                                    src={imagePreview}
                                                    alt="Category preview"
                                                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                                                
                                                {/* Upload Status Badges */}
                                                {uploadProgress === "success" && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Uploaded
                                                    </div>
                                                )}
                                                
                                                {uploadProgress === "uploading" && (
                                                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Uploading...
                                                    </div>
                                                )}
                                                
                                                {uploadProgress === "error" && (
                                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Failed
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Remove Image Button */}
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                disabled={isPending}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        /* Upload Area */
                                        <div
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            className={`
                                                w-64 h-64 border-2 border-dashed rounded-lg 
                                                flex flex-col items-center justify-center 
                                                transition-all cursor-pointer
                                                ${dragActive 
                                                    ? 'border-blue-400 bg-blue-50 scale-105' 
                                                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                                                ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                                <div className={`
                                                    rounded-full p-3 mb-3 transition-colors
                                                    ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}
                                                `}>
                                                    <ImageIcon className={`
                                                        h-8 w-8 transition-colors
                                                        ${dragActive ? 'text-blue-500' : 'text-gray-400'}
                                                    `} />
                                                </div>
                                                <div className="text-center px-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                                        {dragActive ? 'Drop image here' : 'Click or drag to upload'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, WebP up to 5MB
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageSelect}
                                                    disabled={isPending}
                                                />
                                            </label>
                                        </div>
                                    )}

                                    {/* Upload/Re-upload Button */}
                                    {imageFile && !uploadedImage && uploadProgress !== "uploading" && (
                                        <Button
                                            type="button"
                                            onClick={handleUploadImage}
                                            disabled={isPending}
                                            className="w-64"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Image to Cloudinary
                                        </Button>
                                    )}

                                    {uploadedImage && (
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={removeImage}
                                                disabled={isPending}
                                            >
                                                <X className="mr-1 h-3 w-3" />
                                                Remove
                                            </Button>
                                            <label className="cursor-pointer">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isPending}
                                                    onClick={() => {
                                                        // Trigger file input click
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = 'image/*';
                                                        input.onchange = handleImageSelect as any;
                                                        input.click();
                                                    }}
                                                >
                                                    <Upload className="mr-1 h-3 w-3" />
                                                    Change
                                                </Button>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Error Display */}
                            {form.formState.errors.root && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{form.formState.errors.root.message}</p>
                                </div>
                            )}

                            {/* Tips Card */}
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="py-3 px-4">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-blue-700">
                                            <p className="font-medium mb-1">Tips for a great category:</p>
                                            <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                                                <li>Use clear, descriptive names</li>
                                                <li>Add an eye-catching image</li>
                                                <li>Keep names under 50 characters</li>
                                                <li>You can always edit or deactivate later</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/admin/categories")}
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
                                            {uploadImageMutation.isPending 
                                                ? "Uploading Image..." 
                                                : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Create Category
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Auto-save indicator */}
                            {Object.keys(form.formState.dirtyFields).length > 0 && (
                                <p className="text-xs text-center text-gray-400">
                                    You have unsaved changes
                                </p>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}