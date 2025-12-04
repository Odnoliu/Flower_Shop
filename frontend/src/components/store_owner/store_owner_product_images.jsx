import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { ImageService, ProductService } from "../../services";

export default function StoreOwnerProductImages({ productId }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(
    productId ? String(productId) : ""
  );
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [files, setFiles] = useState([]);

  const fileInputRef = useRef(null);

  const activeProductId =
    selectedProductId || (productId ? String(productId) : "");

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await ProductService.list();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.products)
        ? res.products
        : [];
      setProducts(list);
    } catch (e) {
      console.error("Load products error:", e);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadImages = async (pid) => {
    const idNum = Number(pid);
    if (!idNum) {
      setImages([]);
      return;
    }
    try {
      const res = await ImageService.getByProduct(idNum);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.images)
        ? res.images
        : [];
      setImages(list);
    } catch (e) {
      console.error("Load images error:", e);
      setImages([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeProductId) {
      loadImages(activeProductId);
    } else {
      setImages([]);
    }
  }, [activeProductId]);

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    setFiles(fileList);
  };

  const handleConfirmUpload = async () => {
    if (!activeProductId) {
      Swal.fire(
        "Chưa chọn sản phẩm",
        "Vui lòng chọn sản phẩm trước khi tải ảnh.",
        "warning"
      );
      return;
    }
    if (!files.length) {
      Swal.fire(
        "Chưa có ảnh",
        "Vui lòng chọn ít nhất một ảnh để tải lên.",
        "info"
      );
      return;
    }
    setUploading(true);
    const productIdNum = Number(activeProductId);
    let successCount = 0;
    let errorCount = 0;
    try {
      for (const file of files) {
        try {
          await ImageService.upload(file, { PRODUCT_Id: productIdNum });
          successCount += 1;
        } catch (err) {
          console.error("Upload image error:", err);
          errorCount += 1;
        }
      }
      if (successCount > 0 && errorCount == 0) {
        Swal.fire(
          "Thành công",
          `Đã thêm ${successCount} hình ảnh cho sản phẩm.`,
          "success"
        );
      } else if (successCount > 0 && errorCount > 0) {
        Swal.fire(
          "Một phần thành công",
          `Đã thêm ${successCount} hình, nhưng ${errorCount} hình bị lỗi.`,
          "warning"
        );
      } else {
        Swal.fire(
          "Thất bại",
          "Không thể tải lên hình ảnh nào. Vui lòng thử lại.",
          "error"
        );
      }
    } finally {
      setUploading(false);
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (activeProductId) {
        loadImages(activeProductId);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await ImageService.delete(id);
      if (activeProductId) {
        loadImages(activeProductId);
      }
    } catch (e) {
      console.error("Delete image error:", e);
    }
  };

  const getProductName = () => {
    const idNum = Number(activeProductId);
    const p = products.find((x) => (x.PRODUCT_Id ?? x.id) == idNum);
    return p ? p.PRODUCT_Name ?? p.name ?? `Sản phẩm #${idNum}` : "";
  };

  return (
    <div className="p-6 bg-[#FFF9F0] rounded-2xl shadow border border-[#F3E2C2]">
      <h3 className="text-xl font-semibold mb-4 text-[#5B4636]">
        Quản lý hình ảnh mở rộng
      </h3>

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,260px)_1fr] items-end">
        <div>
          <label className="block text-sm font-medium text-[#8C7A64] mb-1">
            Chọn sản phẩm
          </label>
          <select
            value={activeProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl border-[#F3E2C2] focus:outline-none focus:ring-2 focus:ring-[#CDB38B] text-sm bg-white"
          >
            <option value="">
              {loadingProducts ? "Đang tải danh sách..." : "-- Chọn sản phẩm --"}
            </option>
            {products.map((p) => {
              const id = p.PRODUCT_Id ?? p.id;
              const name = p.PRODUCT_Name ?? p.name;
              return (
                <option key={id} value={id}>
                  #{id} - {name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="text-sm text-[#5B4636]">
            {activeProductId ? (
              <>
                Đang chỉnh sửa hình ảnh cho{" "}
                <span className="font-semibold">{getProductName()}</span>
              </>
            ) : (
              <span className="text-red-500">
                Vui lòng chọn sản phẩm trước khi quản lý hình ảnh.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading || !activeProductId}
          className="block"
        />
        {files.length > 0 && (
          <p className="text-xs text-[#8C7A64]">
            Đã chọn {files.length} ảnh.
          </p>
        )}
        <button
          type="button"
          onClick={handleConfirmUpload}
          disabled={uploading || !activeProductId || files.length == 0}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white ${
            uploading || !activeProductId || files.length == 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#C8784A] hover:bg-[#B36A3F]"
          }`}
        >
          {uploading ? "Đang tải..." : "Xác nhận thêm hình"}
        </button>
      </div>

      {!activeProductId ? (
        <p className="text-sm text-gray-500">
          Chưa chọn sản phẩm nào.
        </p>
      ) : images.length == 0 ? (
        <p className="text-sm text-gray-500">
          Chưa có hình ảnh nào cho sản phẩm này. Hãy tải ảnh lên.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => {
            const id = img.IMAGE_Id ?? img.id;
            const src = img.IMAGE_Image ?? img.url;
            return (
              <div
                key={id}
                className="relative border rounded-xl overflow-hidden bg-white shadow"
              >
                <img src={src} alt="" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(id)}
                  className="absolute top-2 right-2 text-white bg-red-500 px-2 py-1 text-xs rounded"
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
