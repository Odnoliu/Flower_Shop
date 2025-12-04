import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { ProductService, PriceService, TypeService } from "../../services"; 

export default function StoreOwnerAddProduct({ onAdded }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    typeId: "",
    description: "",
  });
  const [types, setTypes] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const moneyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await TypeService.list();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.types)
          ? res.types
          : [];
        setTypes(list);
      } catch (e) {
        console.warn("Không load được types", e);
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (key, value) => {
    if (key == "price") {
      const numeric =
        value == "" ? "" : value.toString().replace(/[^\d]/g, "");
      setForm((p) => ({ ...p, price: numeric }));
    } else {
      setForm((p) => ({ ...p, [key]: value }));
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result); 
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      typeId: "",
      description: "",
    });
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
    if (!form.typeId) {
      Swal.fire("Lỗi", "Vui lòng chọn loại sản phẩm (type)", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const priceNumber = Number(form.price);
    const typeIdNum = Number(form.typeId);

    try {
      const productPayload = {
        PRODUCT_Name: form.name.trim(),
        TYPE_Id: typeIdNum,
        PRODUCT_Avatar: imagePreview || null, 
      };
      console.log(productPayload)
      console.log(productPayload)
      const created = await ProductService.create(productPayload);
      const productId =
        created?.PRODUCT_Id ?? created?.id ?? created?.productId;

      if (productId) {
        const effectiveDate = new Date().toISOString().slice(0, 10);
        const pricePayload = {
          PRODUCT_Id: productId,
          PRICE_EffectiveDate: effectiveDate,
          PRICE_UpdatedDate: effectiveDate,
          PRICE_Price: priceNumber,
        };
        console.log(pricePayload)
        await PriceService.create(pricePayload);
      }

      Swal.fire("Thành công", "Đã thêm sản phẩm mới", "success");
      resetForm();
      if (typeof onAdded == "function") onAdded();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Lỗi",
        "Không thể thêm sản phẩm, kiểm tra lại API product/price",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#FFF9F0] rounded-2xl shadow border border-[#F3E2C2]">
      <h3 className="text-xl font-semibold mb-4 text-[#5B4636]">
        Thêm sản phẩm mới
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên + giá */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#8C7A64]">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ví dụ: Bó hoa hồng đỏ"
            className="w-full border px-3 py-2 rounded-xl border-[#F3E2C2] focus:ring-2 focus:ring-[#CDB38B] focus:outline-none bg-white/80"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#8C7A64]">
              Giá (VND) *
            </label>
            <input
              inputMode="numeric"
              value={
                form.price
                  ? moneyFormatter.format(Number(form.price))
                  : ""
              }
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="500000"
              className="w-full border px-3 py-2 rounded-xl border-[#F3E2C2] focus:ring-2 focus:ring-[#CDB38B] focus:outline-none bg-white/80"
              aria-label="price-formatted"
            />
            <div className="text-xs text-[#8C7A64] mt-1">
              Nhập số (không dấu chấm), ví dụ 500000. Hệ thống sẽ lưu đúng
              giá trị số này.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#8C7A64]">
              Loại sản phẩm (Type) *
            </label>
            <select
              value={form.typeId}
              onChange={(e) => handleChange("typeId", e.target.value)}
              className="w-full border px-3 py-2 rounded-xl border-[#F3E2C2] focus:ring-2 focus:ring-[#CDB38B] focus:outline-none bg-white/80"
            >
              <option value="">-- Chọn loại --</option>
              {types.map((t) => {
                const id = t.TYPE_Id ?? t.id;
                const name = t.TYPE_Name ?? t.name;
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#8C7A64]">
              Tải ảnh lên
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                handleFile(f);
              }}
              className="w-full text-sm"
            />
            <div className="text-xs text-[#8C7A64] mt-1">
              Ảnh sẽ được mã hóa base64 và lưu vào PRODUCT_Avatar.
            </div>
          </div>

          {imagePreview ? (
            <div className="mt-2 md:mt-0">
              <div className="text-sm mb-1 text-[#8C7A64]">
                Xem trước ảnh:
              </div>
              <div className="w-40 h-40 rounded-xl overflow-hidden border border-[#F3E2C2] bg-white/60">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#8C7A64]">
            Mô tả
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Mô tả ngắn cho sản phẩm (tùy chọn)"
            className="w-full border px-3 py-2 rounded-xl border-[#F3E2C2] focus:ring-2 focus:ring-[#CDB38B] focus:outline-none bg-white/80"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-xl text-white font-medium ${
              submitting
                ? "bg-gray-400 cursor-wait"
                : "bg-[#C8784A] hover:bg-[#B36A3F]"
            }`}
          >
            {submitting ? "Đang lưu..." : "Thêm sản phẩm"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-[#FFF3DF] text-[#5B4636]"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
