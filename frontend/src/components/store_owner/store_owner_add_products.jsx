import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import axiosClient from "../../api/axios_client";
export default function StoreOwnerAddProduct({ onAdded }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    imageUrl: "",
    description: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const moneyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  const handleChange = (key, value) => {
    if (key == "price") {
      const numeric = value == "" ? "" : value.toString().replace(/[^\d]/g, "");
      setForm((p) => ({ ...p, price: numeric }));
    } else {
      setForm((p) => ({ ...p, [key]: value }));
    }
  };

  const handleImageUrl = (url) => {
    setForm((p) => ({ ...p, imageUrl: url }));
    setImagePreview(url);
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setForm((p) => ({ ...p, imageUrl: "" })); // clear url if using file preview
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({ name: "", price: "", category: "", imageUrl: "", description: "" });
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const validate = () => {
    if (!form.name || form.name.trim().length < 2) {
      Swal.fire("Lỗi", "Tên sản phẩm phải có ít nhất 2 ký tự", "error");
      return false;
    }
    const priceNum = Number(form.price);
    if (!priceNum || priceNum <= 0) {
      Swal.fire("Lỗi", "Giá phải lớn hơn 0", "error");
      return false;
    }
    return true;
  };

  const saveToLocalMock = (product) => {
    try {
      const raw = localStorage.getItem("__mock_products");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(product);
      localStorage.setItem("__mock_products", JSON.stringify(arr));
    } catch (e) {
      console.error("Lưu mock thất bại", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category || "Chung",
      image: imagePreview || form.imageUrl || "",
      description: form.description || "",
      created_at: new Date().toISOString(),
    };
    try {
      if (axiosClient && typeof axiosClient.post == "function") {
        await axiosClient.post("/products", payload);
        Swal.fire("Thành công", "Đã thêm sản phẩm vào server", "success");
      } else {
        throw new Error("No axiosClient");
      }
    } catch (err) {
      console.warn("POST failed -> fallback to localStorage mock", err);
      saveToLocalMock({ id: Date.now(), ...payload });
      Swal.fire("Lưu tạm", "API không khả dụng — đã lưu cục bộ (mock)", "info");
    } finally {
      setSubmitting(false);
      resetForm();
      if (typeof onAdded == "function") onAdded();
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Thêm sản phẩm mới</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ví dụ: Bó hoa hồng đỏ"
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-[#CDB38B]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Giá (VND) *</label>
            <input
              inputMode="numeric"
              value={form.price ? moneyFormatter.format(Number(form.price)) : ""}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="500000"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-[#CDB38B]"
              aria-label="price-formatted"
            />
            <div className="text-xs text-gray-500 mt-1">
              Nhập chỉ số, ví dụ 500000 (mã hóa hiển thị thành dạng tiền)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-[#CDB38B]"
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="Sinh nhật">Sinh nhật</option>
              <option value="Sự kiện">Sự kiện</option>
              <option value="Lễ tình nhân">Lễ tình nhân</option>
              <option value="Tang lễ">Tang lễ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ảnh (URL)</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => handleImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-[#CDB38B]"
          />
          <div className="text-xs text-gray-500 mt-1">Hoặc tải file ảnh bên dưới để preview (không upload)</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tải ảnh lên (preview)</label>
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              handleFile(f);
            }}
            className="w-full"
          />
        </div>

        {imagePreview ? (
          <div className="mt-2">
            <div className="text-sm mb-1">Xem trước ảnh:</div>
            <div className="w-40 h-40 rounded overflow-hidden border">
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            </div>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Mô tả ngắn"
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-[#CDB38B]"
            rows={4}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded text-white font-medium ${submitting ? "bg-gray-400 cursor-wait" : "bg-green-600 hover:bg-green-700"}`}
          >
            {submitting ? "Đang lưu..." : "Thêm sản phẩm"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={submitting}
            className="px-4 py-2 rounded bg-gray-100"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
