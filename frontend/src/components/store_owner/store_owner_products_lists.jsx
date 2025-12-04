import React, { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { ProductService, PriceService, TypeService } from "../../services"; 

export default function StoreOwnerProducts() {
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    typeId: "",
    price: "",
    avatar: "", 
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ProductService.list(); 
      console.log(res)
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.products)
        ? res.products
        : [];
      console.log(list)
      setProducts(list);
    } catch (e) {
      console.warn("Không lấy được products từ API, dùng demo", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTypes = useCallback(async () => {
    try {
      const res = await TypeService.list();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.types)
        ? res.types
        : [];
      setTypes(list);
    } catch (e) {
      console.warn("Không lấy được type", e);
      setTypes([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchTypes();
  }, [fetchProducts, fetchTypes]);

  const typeMap = useMemo(() => {
    const map = {};
    types.forEach((t) => {
      const id = t.TYPE_Id ?? t.id;
      const name = t.TYPE_Name ?? t.name;
      if (id != null) map[id] = name;
    });
    return map;
  }, [types]);

  const handleChange = (k, v) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleAvatarFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result || "";
      setForm((prev) => ({ ...prev, avatar: dataUrl }));
      setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const createOrUpdatePrice = async (productId, price) => {
    console.log(productId, price)
    if (!price || !productId) return;
    const effectiveDate = new Date().toISOString().slice(0, 10);
    const payload = {
      PRODUCT_Id: productId,
      PRICE_UpdatedDate: effectiveDate,
      PRICE_Price: Number(price),
    };
    console.log(payload)
    try {
      await PriceService.update(productId, payload);
    } catch (e) {
      console.warn("Không thể tạo price, kiểm tra PriceController/Routes", e);
    }
  };

  const startEdit = async (p) => {
    const id = p.PRODUCT_Id ?? p.id;
    let currentPrice = "";

    try {
      const res = await PriceService.getByProductId(id);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.prices)
        ? res.prices
        : [];
      if (list.length > 0) {
        list.sort((a, b) =>
          String(a.PRICE_EffectiveDate ?? "").localeCompare(
            String(b.PRICE_EffectiveDate ?? "")
          )
        );
        const last = list[list.length - 1];
        currentPrice = last.PRICE_Price ?? last.price ?? "";
      }
    } catch (e) {
      console.warn("Không load được price cho product", e);
    }

    const currentAvatar = p.PRODUCT_Avatar ?? p.image ?? "";

    setEditing(p);
    setForm({
      name: p.PRODUCT_Name ?? p.name ?? "",
      typeId: p.TYPE_Id ?? p.typeId ?? "",
      price: currentPrice ? String(currentPrice) : "",
      avatar: currentAvatar,
    });
    setAvatarPreview(currentAvatar);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", typeId: "", price: "", avatar: "" });
    setAvatarPreview("");
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const id = editing.PRODUCT_Id ?? editing.id;
    if (!form.name || !form.typeId) {
      Swal.fire("Lỗi", "Tên và loại sản phẩm không được trống", "error");
      return;
    }

    const payload = {
      PRODUCT_Name: form.name.trim(),
      TYPE_Id: Number(form.typeId),
    };

    const finalAvatar =
      form.avatar || editing.PRODUCT_Avatar || editing.image || "";
    if (finalAvatar) {
      payload.PRODUCT_Avatar = finalAvatar;
    }

    try {
      await ProductService.update(id, payload);
      await createOrUpdatePrice(id, form.price);
      Swal.fire("Thành công", "Cập nhật sản phẩm thành công", "success");
      resetForm();
      fetchProducts();
    } catch (e) {
      console.error(e);
      Swal.fire("Lỗi", "Không thể cập nhật sản phẩm", "error");
    }
  };

  const handleDelete = async (p) => {
    const id = p.PRODUCT_Id ?? p.id;
    const r = await Swal.fire({
      title: "Xóa sản phẩm?",
      text: "Bạn chắc chắn muốn xóa sản phẩm này?",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (!r.isConfirmed) return;
    try {
      await ProductService.remove(id);
      Swal.fire("Đã xóa", "", "success");
      fetchProducts();
    } catch (e) {
      console.warn(e);
      Swal.fire("Lỗi", "Không thể xóa sản phẩm", "error");
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const s = search.toLowerCase();
    return products.filter((p) =>
      (p.PRODUCT_Name ?? p.name ?? "").toLowerCase().includes(s)
    );
  }, [products, search]);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-6">
      <h2 className="text-3xl font-bold text-[#5B4636] mb-4">
        Quản lý sản phẩm
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Form chỉnh sửa nhanh */}
        <div className="bg-white/80 rounded-2xl p-4 shadow border border-[#F3E2C2]">
          <h3 className="font-semibold text-[#5B4636] mb-3">
            {editing
              ? `Sửa sản phẩm #${editing.PRODUCT_Id ?? editing.id}`
              : "Chọn sản phẩm để chỉnh sửa"}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#8C7A64] mb-1">
                Tên sản phẩm
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Tên sản phẩm"
                className="w-full px-3 py-2 border rounded-xl border-[#F3E2C2] focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8C7A64] mb-1">
                Loại (Danh mục)
              </label>
              <select
                value={form.typeId}
                onChange={(e) => handleChange("typeId", e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-[#F3E2C2] focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
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

            <div>
              <label className="block text-sm font-medium text-[#8C7A64] mb-1">
                Giá hiện tại (VND)
              </label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Nhập giá"
                className="w-full px-3 py-2 border rounded-xl border-[#F3E2C2] focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8C7A64] mb-1">
                Ảnh đại diện sản phẩm
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  handleAvatarFile(file);
                }}
                className="w-full text-sm"
              />
              {avatarPreview ? (
                <div className="mt-2">
                  <div className="text-xs text-[#8C7A64] mb-1">Xem trước:</div>
                  <div className="w-24 h-24 rounded-lg border border-[#F3E2C2] overflow-hidden">
                    <img
                      src={avatarPreview}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                disabled={!editing}
                onClick={handleUpdate}
                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white ${
                  editing
                    ? "bg-[#C8784A] hover:bg-[#B36A3F]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#FFF3DF] text-[#5B4636]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-4 shadow border border-[#F3E2C2]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#5B4636]">
              Danh sách sản phẩm
            </h3>
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-xl text-sm border-[#F3E2C2] focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
            />
          </div>

          {loading ? (
            <div>Đang tải...</div>
          ) : filteredProducts.length == 0 ? (
            <div className="text-sm text-gray-500 py-4">
              Chưa có sản phẩm nào.
            </div>
          ) : (
            <div className="overflow-auto max-h-[520px]">
              <table className="w-full border-separate border-spacing-y-3 text-sm">
                <thead>
                  <tr className="text-left text-[#8C7A64]">
                    <th className="pb-2 font-semibold">Ảnh</th>
                    <th className="pb-2 font-semibold">Tên sản phẩm</th>
                    <th className="pb-2 font-semibold">Loại</th>
                    <th className="pb-2 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const id = product.PRODUCT_Id ?? product.id;
                    const name = product.PRODUCT_Name ?? product.name;
                    const typeName =
                      product.TYPE_Name ??
                      typeMap[product.TYPE_Id] ??
                      "";
                    const avatar = product.PRODUCT_Avatar ?? product.image;

                    return (
                      <tr
                        key={id}
                        className="bg-white shadow-sm hover:shadow-md rounded-xl transition-shadow duration-200"
                      >
                        <td className="py-4 px-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={name}
                              className="w-16 h-16 object-cover rounded-lg border border-[#F3E2C2]"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg border border-dashed border-[#F3E2C2] flex items-center justify-center text-xs text-[#8C7A64]">
                              No image
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-3 font-medium text-[#5B4636]">
                          {name}
                        </td>
                        <td className="py-4 px-3 text-[#8C7A64]">
                          {typeName}
                        </td>
                        <td className="py-4 px-3">
                          <button
                            onClick={() => startEdit(product)}
                            className="text-[#2C7BE5] hover:underline mr-3 text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-500 hover:underline text-sm"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
