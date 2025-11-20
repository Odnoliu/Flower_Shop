import React, { useEffect, useState, useCallback } from "react";
import axiosClient from "../../api/axios_client";
import Swal from "sweetalert2";

export default function StoreOwnerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: 0, category: "", image: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/products");
      setProducts(res.data || []);
    } catch (e) {
      console.warn("Không lấy được products từ API, dùng dữ liệu demo");
      setProducts([
        { id: 1, name: "Bó hoa demo", price: 250000, category: "Sinh nhật", image: "", description: "Demo" },
        { id: 2, name: "Giỏ hoa VIP", price: 750000, category: "Sự kiện", image: "", description: "Demo" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleAdd = async () => {
    try {
      await axiosClient.post("/products", form);
      Swal.fire("Thành công", "Đã thêm sản phẩm", "success");
      setForm({ name: "", description: "", price: 0, category: "", image: "" });
      fetch();
    } catch (e) {
      Swal.fire("Lỗi", "Không thể thêm", "error");
    }
  };

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`/products/${editing.id}`, form);
      Swal.fire("Thành công", "Cập nhật OK", "success");
      setEditing(null);
      setForm({ name: "", description: "", price: 0, category: "", image: "" });
      fetch();
    } catch (e) {
      Swal.fire("Lỗi", "Không thể cập nhật", "error");
    }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: "Xóa?", text: "Bạn chắc không?", showCancelButton: true });
    if (!r.isConfirmed) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      Swal.fire("Đã xóa", "", "success");
      fetch();
    } catch (e) {
      Swal.fire("Lỗi", "Không thể xóa", "error");
    }
  };

  const startEdit = (p) => { setEditing(p); setForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: p.image }); };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Quản lý sản phẩm</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded p-4 shadow">
          <h3 className="font-medium mb-2">
            {editing ? `Sửa #${editing.id}` : "Thêm mới"}
          </h3>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Tên"
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            value={form.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            placeholder="Giá"
            type="number"
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Danh mục"
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            value={form.image}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="URL ảnh"
            className="w-full mb-2 p-2 border rounded"
          />
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Mô tả"
            className="w-full mb-2 p-2 border rounded"
          />
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="px-3 py-2 bg-yellow-500 text-white rounded"
                >
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      name: "",
                      description: "",
                      price: 0,
                      category: "",
                      image: "",
                    });
                  }}
                  className="px-3 py-2 bg-gray-300 rounded"
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                onClick={handleAdd}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Thêm
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded p-4 shadow overflow-auto max-h-[520px]">
          <h3 className="font-medium mb-2">Danh sách</h3>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <table className="w-full border-separate border-spacing-y-4">
              {" "}
              <thead>
                <tr className="text-left text-gray-700">
                  <th className="pb-3 font-semibold">Ảnh</th>
                  <th className="pb-3 font-semibold">Tên sản phẩm</th>
                  <th className="pb-3 font-semibold">Giá</th>
                  <th className="pb-3 font-semibold">Danh mục</th>
                  <th className="pb-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="bg-white shadow-sm hover:shadow-md rounded-xl transition-shadow duration-200"
                  >
                    <td className="py-6 px-4 first:rounded-l-xl last:rounded-r-xl">
                      <img
                        src={product.image}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="py-6 px-4 font-medium">{product.name}</td>
                    <td className="py-6 px-4 text-green-600 font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </td>
                    <td className="py-6 px-4 text-gray-600">
                      {product.category}
                    </td>
                    <td className="py-6 px-4">
                      <button className="text-blue-600 hover:underline mr-3">
                        Sửa
                      </button>
                      <button className="text-red-600 hover:underline">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
