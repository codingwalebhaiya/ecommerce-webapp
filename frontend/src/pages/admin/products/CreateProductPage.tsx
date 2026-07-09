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
    Plus,
    AlertCircle,
    CheckCircle2,
    Info,
    DollarSign,
    Package,
    Tag,
    Layers
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
import { useCreateProduct, useUploadProductImages } from "@/hooks/useProducts";
import { useAllCategories } from "@/hooks/useCategory";

// Validation schema
const createProductSchema = z.object({
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
    brand: z.string().min(1, "Brand is required").max(100, "Brand name too long"),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

type CreateProductFormData = z.infer<typeof createProductSchema>;

export default function CreateProductPage() {
    const navigate = useNavigate();
    
    // API hooks
    const { data: categoriesData, isLoading: catLoading } = useAllCategories();
    const createMutation = useCreateProduct();
    const uploadMutation = useUploadProductImages();
    
    const categories = categoriesData?.data || [];
    
    // Image states
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<Array<{
        productImageUrl: string;
        productImagePublicId: string;
    }>>([]);
    const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [dragActive, setDragActive] = useState(false);

    const form = useForm<CreateProductFormData>({
        resolver: zodResolver(createProductSchema),
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

    // Handle drag events for image upload
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

        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
            validateAndAddFiles(files);
        }
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            validateAndAddFiles(files);
        }
    };

    // Validate and add files
    const validateAndAddFiles = (files: File[]) => {
        const totalAfterAdd = imageFiles.length + uploadedImages.length + files.length;
        
        if (totalAfterAdd > 3) {
            form.setError("root", {
                message: `You can only upload up to 3 images. Currently have ${imageFiles.length + uploadedImages.length} images.`
            });
            return;
        }

        const validFiles: File[] = [];
        
        files.forEach(file => {
            if (!file.type.startsWith("image/")) {
                form.setError("root", { message: `${file.name} is not a valid image file` });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                form.setError("root", { message: `${file.name} is larger than 5MB` });
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setImageFiles(prev => [...prev, ...validFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setUploadProgress("idle");
            form.clearErrors("root");
        }
    };

    // Remove new image
    const removeImage = (index: number) => {
        if (imagePreviews[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviews[index]);
        }
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Remove uploaded image
    const removeUploadedImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Upload images to Cloudinary
    const handleUploadImages = async () => {
        if (imageFiles.length === 0) {
            form.setError("root", { message: "Please select at least one image" });
            return;
        }
        
        setUploadProgress("uploading");
        
        try {
            const formData = new FormData();
            imageFiles.forEach((file) => {
                formData.append("images", file);
            });
            
            const uploadRes = await uploadMutation.mutateAsync(formData);
            const newImages = uploadRes.data?.images || uploadRes.images || uploadRes.data || [];
            
            // Normalize image format
            const normalizedImages = (Array.isArray(newImages) ? newImages : []).map((img: any) => ({
                productImageUrl: img.productImageUrl || img.url || img.secure_url,
                productImagePublicId: img.productImagePublicId || img.publicId || img.public_id,
            }));
            
            setUploadedImages(prev => [...prev, ...normalizedImages]);
            
            // Clear file inputs
            imagePreviews.forEach(url => {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
            setImageFiles([]);
            setImagePreviews([]);
            setUploadProgress("success");
            
            // Reset success state after delay
            setTimeout(() => {
                setUploadProgress("idle");
            }, 2000);
            
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadProgress("error");
            form.setError("root", { message: "Failed to upload images. Please try again." });
        }
    };

    // Submit form
    const onSubmit = async (data: CreateProductFormData) => {
        // Check if we have images (either uploaded or pending)
        if (uploadedImages.length === 0 && imageFiles.length === 0) {
            form.setError("root", { 
                message: "Please upload at least one product image" 
            });
            return;
        }

        // Upload pending images if any
        let finalImages = [...uploadedImages];
        
        if (imageFiles.length > 0) {
            try {
                const formData = new FormData();
                imageFiles.forEach((file) => {
                    formData.append("images", file);
                });
                
                const uploadRes = await uploadMutation.mutateAsync(formData);
                const newImages = uploadRes.data?.images || uploadRes.images || uploadRes.data || [];
                
                const normalizedImages = (Array.isArray(newImages) ? newImages : []).map((img: any) => ({
                    productImageUrl: img.productImageUrl || img.url || img.secure_url,
                    productImagePublicId: img.productImagePublicId || img.publicId || img.public_id,
                }));
                
                finalImages = [...finalImages, ...normalizedImages];
            } catch (error) {
                console.error("Upload failed:", error);
                form.setError("root", { message: "Failed to upload images" });
                return;
            }
        }

        // Prepare product data
        const productData = {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            category: data.category,
            brand: data.brand,
            isFeatured: data.isFeatured,
            isActive: data.isActive,
            images: finalImages,
        };

        try {
            await createMutation.mutateAsync(productData);
            // Navigation handled by mutation onSuccess
            navigate("/admin/products");
        } catch (error) {
            console.error("Failed to create product:", error);
        }
    };

    const isPending = createMutation.isPending || uploadMutation.isPending;
    const totalImages = imageFiles.length + uploadedImages.length;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
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
                    New Product
                </Badge>
            </div>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Product</CardTitle>
                    <CardDescription>
                        Add a new product to your store. Fill in all the required fields and upload product images.
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
                                        <FormLabel className="text-base">
                                            Product Name <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter product name" 
                                                {...field}
                                                disabled={isPending}
                                                autoFocus
                                                className="text-lg"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            A clear, descriptive name for your product
                                        </FormDescription>
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
                                        <FormLabel className="text-base">
                                            Description <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Describe your product in detail..." 
                                                rows={5}
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <div className="flex justify-between">
                                            <FormDescription>
                                                Include key features and specifications
                                            </FormDescription>
                                            <span className="text-xs text-gray-400">
                                                {field.value?.length || 0}/2000
                                            </span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price & Stock Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                <DollarSign className="inline h-4 w-4 mr-1" />
                                                Price <span className="text-red-500">*</span>
                                            </FormLabel>
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
                                            <FormDescription>
                                                Set the selling price in USD
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                <Package className="inline h-4 w-4 mr-1" />
                                                Stock Quantity <span className="text-red-500">*</span>
                                            </FormLabel>
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
                                            <FormDescription>
                                                Available quantity in inventory
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Category & Brand Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                <Layers className="inline h-4 w-4 mr-1" />
                                                Category <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Select 
                                                onValueChange={field.onChange} 
                                                value={field.value}
                                                disabled={isPending || catLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={
                                                            catLoading ? "Loading categories..." : "Select a category"
                                                        } />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {catLoading ? (
                                                        <div className="flex items-center justify-center p-4">
                                                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                                            <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                                        </div>
                                                    ) : categories.length === 0 ? (
                                                        <div className="p-4 text-center text-sm text-gray-500">
                                                            No categories available
                                                        </div>
                                                    ) : (
                                                        categories.map((cat: any) => (
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
                                            <FormDescription>
                                                Select the product category
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                <Tag className="inline h-4 w-4 mr-1" />
                                                Brand <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter brand name" 
                                                    {...field}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Manufacturer or brand name
                                            </FormDescription>
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
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                                            <div>
                                                <FormLabel className="text-base">Featured Product</FormLabel>
                                                <FormDescription>
                                                    Show in featured section on homepage
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
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                                            <div>
                                                <FormLabel className="text-base">Active</FormLabel>
                                                <FormDescription>
                                                    Product visible to customers
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
                                    <FormLabel className="text-base">
                                        Product Images <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormDescription>
                                        Upload 1-3 high-quality product images. First image will be the main display image.
                                    </FormDescription>
                                </div>

                                {/* Uploaded Images */}
                                {uploadedImages.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Uploaded
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {uploadedImages.length} image(s) uploaded to Cloudinary
                                            </span>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            {uploadedImages.map((image, index) => (
                                                <div key={index} className="relative w-32 h-32 group">
                                                    <img
                                                        src={image.productImageUrl}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-lg border-2 border-green-200"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeUploadedImage(index)}
                                                        disabled={isPending}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                    <Badge className="absolute top-2 left-2 text-xs">
                                                        {index === 0 ? "Main" : index + 1}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="bg-blue-500 text-white">
                                                New
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {imagePreviews.length} new image(s) selected
                                            </span>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative w-32 h-32 group">
                                                    <img
                                                        src={preview}
                                                        alt={`New ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-lg border-2 border-blue-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
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

                                {/* Upload Area */}
                                {totalImages < 3 && (
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`
                                            border-2 border-dashed rounded-lg p-8
                                            flex flex-col items-center justify-center 
                                            transition-all cursor-pointer
                                            ${dragActive 
                                                ? 'border-blue-400 bg-blue-50 scale-105' 
                                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                                            ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <label className="flex flex-col items-center cursor-pointer">
                                            <div className={`
                                                rounded-full p-3 mb-3 transition-colors
                                                ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}
                                            `}>
                                                {dragActive ? (
                                                    <Upload className="h-8 w-8 text-blue-500" />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    {dragActive ? 'Drop images here' : 'Click or drag to upload'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, WebP up to 5MB each
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {totalImages}/3 images selected
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileSelect}
                                                disabled={isPending}
                                            />
                                        </label>
                                    </div>
                                )}

                                {/* Upload Button */}
                                {imageFiles.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            onClick={handleUploadImages}
                                            disabled={isPending || uploadProgress === "uploading"}
                                            variant="default"
                                        >
                                            {uploadProgress === "uploading" ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : uploadProgress === "success" ? (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Uploaded!
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload {imageFiles.length} Image(s)
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                imagePreviews.forEach(url => {
                                                    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
                                                });
                                                setImageFiles([]);
                                                setImagePreviews([]);
                                                setUploadProgress("idle");
                                            }}
                                            disabled={isPending}
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                )}

                                {/* Image Tips */}
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="py-3 px-4">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-blue-700">
                                                <p className="font-medium mb-1">Image Guidelines:</p>
                                                <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                                                    <li>Upload 1-3 high-quality images</li>
                                                    <li>First image becomes the main product image</li>
                                                    <li>Recommended size: 800x800 pixels</li>
                                                    <li>Use clear, well-lit product photos</li>
                                                    <li>Show different angles and details</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                            <div className="flex gap-4 pt-2">
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
                                                : "Creating Product..."}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Create Product
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