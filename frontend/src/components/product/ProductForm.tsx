import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/services/product.service";
import { createProductSchema, CreateProductFormValues } from "@/schemas/product.schema";
import { useState } from "react";
import { ProductImageType } from "@/types/product.types";
import uploadImageToCloudinary from "@/services/cloudinary.service";

const ProductForm = () => {
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<ProductImageType[]>([]);

  const { register, handleSubmit, formState: { errors } } =
    useForm<CreateProductFormValues>({
      resolver: zodResolver(createProductSchema),
    });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const fileChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    try {
      const uploaded = await Promise.all(
        files.map((file) => uploadImageToCloudinary(file))
      );

      setUploadedImages((prev) => [...prev, ...uploaded])
    } catch (error) {
      console.log("Upload failed", error);

    }
  }

  const onSubmit = (data: CreateProductFormValues) => {
    mutation.mutate({
      ...data,
      images: uploadedImages
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md"
    >
      <input {...register("name")} placeholder="Name" />
      <p>{errors.name?.message}</p>

      <textarea {...register("description")} placeholder="Description" />
      <p>{errors.description?.message}</p>

      <input {...register("price", { valueAsNumber: true })} placeholder="Price" type="number" />
      <p>{errors.price?.message}</p>

      <input {...register("discountPrice", { valueAsNumber: true })} placeholder="Discount Price" type="number" />
      <p>{errors.discountPrice?.message}</p>

      <input {...register("category")} placeholder="Category" />
      <p>{errors.category?.message}</p>

      <input {...register("brand")} placeholder="Brand" />
      <p>{errors.brand?.message}</p>

      <input {...register("stock", { valueAsNumber: true })} placeholder="Stock" type="number" />
      <p>{errors.stock?.message}</p>

      <input type="file" multiple onChange={fileChangeHandler} />
      <p>{errors.images?.message}</p>

      <div className="flex gap-2">
        {uploadedImages.map((img) => (
          <img
            key={img.public_id}
            src={img.secure_url}
            className="w-20 h-20 object-cover"
          />
        ))}
      </div>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Create Product
      </button>
    </form>
  );
};

export default ProductForm;