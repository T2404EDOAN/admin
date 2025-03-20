import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import { Pagination } from "antd";
import Label from "../form/Label";

interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string | File;
  category: Category;
  basePrice: number;
  status: string;
  size: string;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProductOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    imageUrl: "",
    basePrice: 0,
    status: "ACTIVE",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    code: "",
    description: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productCode, setProductCode] = useState<string>("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://skystar.io.vn/api/products?pageNo=${
          pagination.current - 1
        }&pageSize=${pagination.pageSize}`
      );

      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.content || []);
      setPagination((prev) => ({
        ...prev,
        total: data.totalElements || 0,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://skystar.io.vn/api/productCategories"
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data || []); // Updated to handle direct array response
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setFormData(selectedProduct);
    } else {
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        basePrice: 0,
        status: "ACTIVE",
      });
    }
  }, [selectedProduct]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  const handleEditProduct = async (id: number) => {
    try {
      const response = await fetch(`http://skystar.io.vn/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const product = await response.json();
      setSelectedProduct(product);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleUpdateProduct = async (
    productId: number,
    updatedFields: Partial<Product>
  ) => {
    try {
      // Create complete product data including unchanged fields
      const completeProductData = {
        id: productId,
        name: updatedFields.name || selectedProduct?.name,
        description: updatedFields.description || selectedProduct?.description,
        imageUrl: updatedFields.imageUrl || selectedProduct?.imageUrl,
        basePrice: updatedFields.basePrice || selectedProduct?.basePrice,
        status: updatedFields.status || selectedProduct?.status,
        category: selectedProduct?.category, // Keep original category
        displayOrder: selectedProduct?.displayOrder,
        createdAt: selectedProduct?.createdAt,
        updatedAt: selectedProduct?.updatedAt,
      };

      console.log("Complete product data for update:", completeProductData);

      const response = await fetch(
        `http://skystar.io.vn/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(completeProductData),
        }
      );

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) throw new Error("Failed to update product");
      await fetchProducts();
      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const response = await fetch(
          `http://skystar.io.vn/api/products/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete product");
        await fetchProducts(); // Refresh the list
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      const formData = new FormData();

      // Create product object matching server structure
      const productJson = {
        name: productData.name || "",
        description: productData.description || "",
        basePrice: productData.basePrice || 0,
        status: productData.status || "ACTIVE",
        size: null,
        displayOrder: null,
        category: productData.category
          ? {
              id: productData.category.id,
              name: productData.category.name,
              code: productData.category.code,
              description: productData.category.description,
            }
          : null,
      };

      // Convert to string and create text blob
      const jsonString = JSON.stringify(productJson, null, 2);
      console.log("Product JSON:", jsonString);

      // Create text blob with JSON data
      const jsonBlob = new Blob([jsonString], { type: "application/json" });
      formData.append("product", jsonBlob);

      // Append image file if exists
      if (productData.imageUrl instanceof File) {
        formData.append("image", productData.imageUrl);
      }

      // Add hidden textarea to show JSON in form
      const form = document.querySelector("form");
      if (form) {
        const textArea = document.createElement("textarea");
        textArea.value = jsonString;
        textArea.style.display = "none";
        textArea.name = "productJson";
        form.appendChild(textArea);
      }

      const response = await fetch("http://skystar.io.vn/api/products/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create product");
      await fetchProducts();
      setIsModalOpen(false);
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jsonData = {
        name: newCategory.name || "",
        code: newCategory.code || "",
        description: newCategory.description || "",
      };

      // Log the JSON data being sent
      console.log(
        "Category data being sent:",
        JSON.stringify(jsonData, null, 2)
      );

      const response = await fetch(
        "http://skystar.io.vn/api/productCategories/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonData),
        }
      );

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create category");
      }

      await fetchCategories();
      setIsCategoryModalOpen(false);
      setNewCategory({ name: "", code: "", description: "" });
    } catch (error) {
      console.error("Error creating category:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      // Only include fields that have actually changed
      const changedFields: Partial<Product> = {};

      (Object.keys(formData) as Array<keyof Product>).forEach((key) => {
        if (formData[key] !== selectedProduct[key]) {
          changedFields[key] = formData[key];
        }
      });

      console.log("Changed fields:", changedFields);

      if (Object.keys(changedFields).length > 0) {
        await handleUpdateProduct(selectedProduct.id, changedFields);
      }
    } else {
      await handleCreateProduct(formData);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageUrl: file });
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clean up preview URL when modal closes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      basePrice: 0,
      status: "ACTIVE",
    });
    setProductCode("");
    setImagePreview(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell
                isHeader
                className="w-16 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-20r"
              >
                STT
              </TableCell>
              <TableCell
                isHeader
                className="w-24 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Hình ảnh
              </TableCell>
              <TableCell
                isHeader
                className="w-64 px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[64px] bg-white dark:bg-gray-800 z-20 "
              >
                Tên sản phẩm
              </TableCell>
              <TableCell
                isHeader
                className="w-64 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[64px] bg-white dark:bg-gray-800 z-20"
              >
                Mô tả
              </TableCell>

              <TableCell
                isHeader
                className="w-40 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Giá
              </TableCell>
              <TableCell
                isHeader
                className="w-40 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Trạng thái
              </TableCell>
              <TableCell
                isHeader
                className="w-40 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Không có dữ liệu sản phẩm
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-center ">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    {product.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    <div
                      className="truncate max-w-[340px]"
                      title={product.description}
                    >
                      {product.description}
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    {product.basePrice.toLocaleString("vi-VN")} đ
                  </TableCell>

                  <TableCell className="px-6 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                    <div className="flex">
                      <Badge
                        size="sm"
                        color={
                          product.status === "ACTIVE" ? "success" : "error"
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4  text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 flex justify-end border-t border-gray-200">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} sản phẩm`
          }
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
          showSizeChanger
          defaultPageSize={10}
          pageSizeOptions={["10", "20", "50"]}
        />
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
          setFormData({
            name: "",
            description: "",
            imageUrl: "",
            basePrice: 0,
            status: "ACTIVE",
          });
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-xl w-full rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              {selectedProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Mã sản phẩm</Label>
                  <Input
                    id="code"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Giá</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basePrice: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="image">Hình ảnh sản phẩm</Label>
                  <div className="space-y-2">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required={!selectedProduct}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
                {!selectedProduct && (
                  <div className="col-span-2">
                    <Label htmlFor="category">Danh mục*</Label>
                    <div className="flex gap-2">
                      <select
                        id="category"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        value={formData.category?.id || ""}
                        onChange={(e) => {
                          const categoryId = Number(e.target.value);
                          const selectedCategory = categories.find(
                            (c) => c.id === categoryId
                          );
                          setFormData({
                            ...formData,
                            category: selectedCategory,
                          });
                        }}
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                    setFormData({
                      name: "",
                      description: "",
                      imageUrl: "",
                      basePrice: 0,
                      status: "ACTIVE",
                    });
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {selectedProduct ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm danh mục mới
            </Dialog.Title>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Tên danh mục*</Label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryCode">Mã danh mục*</Label>
                <Input
                  id="categoryCode"
                  value={newCategory.code}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, code: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryDescription">Mô tả</Label>
                <textarea
                  id="categoryDescription"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
