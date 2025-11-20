# Hale's Flower Shop – Admin Dashboard & Website

Một dự án bán hoa đầy đủ (frontend + mock backend) được xây dựng bằng **React + Vite + TailwindCSS**, phong cách sang trọng, tinh tế và cực kỳ dễ mở rộng.

## Tính năng nổi bật
- Giao diện admin hiện đại (quản lý sản phẩm, đơn hàng)
- Thêm/sửa/xóa sản phẩm (có fallback localStorage khi không có API)
- Quản lý đơn hàng + cập nhật trạng thái realtime
- Export danh sách đơn hàng ra CSV
- Footer & UI siêu đẹp, animation mượt mà (Framer Motion + lucide-react)
- Mock API bằng **json-server**

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Axios
- SweetAlert2
- date-fns
- lucide-react
- json-server (mock backend)

## Yêu cầu
- Node.js ≥ 18

## Cài đặt & chạy dự án

### 1. Clone repository
```bash
git clone https://github.com/Odnoliu/hales-flower-shop.git
cd hales-flower-shop
```
### 2. Cài dependencies
```bash
npm install
```
### 3. Chạy mock backend (json-server)
Mở terminal thứ nhất và chạy:
```bash
npx json-server --watch db.json --port 3001
```

### 4. Chạy dự án frontend (Vite dev server)
Mở terminal thứ hai và chạy:
```bash
npm run dev
```
Mở trình duyệt tại: http://localhost:5173