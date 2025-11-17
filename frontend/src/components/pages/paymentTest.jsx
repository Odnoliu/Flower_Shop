import React, { useState } from 'react';

const banks = [
  { bin: '970422', name: 'MB Bank' },
  { bin: '970423', name: 'TPBank' },
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970407', name: 'Techcombank' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970405', name: 'Agribank' },
];

const formatMoney = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

const getBankName = (bin) => {
  const bank = banks.find(b => b.bin === bin);
  return bank ? bank.name : 'Ngân hàng khác';
};

const QRPayment = () => {
  const [form, setForm] = useState({
    bank_bin: '',
    account_number: '',
    account_name: '',
    amount: '',
    description: 'Thanh toan'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    const payload = {
      bank_bin: form.bank_bin,
      account_number: form.account_number,
      account_name: form.account_name,
      amount: parseInt(form.amount),
      description: form.description || 'Thanh toan'
    };

    try {
      const res = await fetch('http://localhost:8000/payment/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi không xác định');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Tạo Mã QR Thanh Toán</h1>

      <form onSubmit={handleSubmit}>
        <label>Ngân hàng</label>
        <select id="bank_bin" value={form.bank_bin} onChange={handleChange} required>
          <option value="">-- Chọn ngân hàng --</option>
          {banks.map(bank => (
            <option key={bank.bin} value={bank.bin}>{bank.name}</option>
          ))}
        </select>

        <label>Số tài khoản</label>
        <input
          type="text"
          id="account_number"
          placeholder="123456789"
          value={form.account_number}
          onChange={handleChange}
          required
        />

        <label>Tên tài khoản (không bắt buộc)</label>
        <input
          type="text"
          id="account_name"
          placeholder="NGUYEN VAN A"
          value={form.account_name}
          onChange={handleChange}
        />

        <label>Số tiền (VNĐ)</label>
        <input
          type="number"
          id="amount"
          placeholder="100000"
          min="1000"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <label>Nội dung chuyển khoản</label>
        <input
          type="text"
          id="description"
          placeholder="Thanh toan don hang #123"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo Mã QR'}
        </button>
      </form>

      {error && <p className="error">Lỗi: {error}</p>}

      {result && (
        <div className="result">
          <h3>Mã QR Thanh Toán</h3>
          <img src={result.qr_code} alt="QR Code" className="qr-code" />
          <div className="info">
            <strong>Ngân hàng:</strong> {getBankName(result.bank_bin)}<br />
            <strong>Tài khoản:</strong> {result.account_number} - {result.account_name || 'Không tên'}<br />
            <strong>Số tiền:</strong> {formatMoney(result.amount)} VNĐ<br />
            <strong>Nội dung:</strong> {result.description}
          </div>
          <p><a href={result.qr_link} target="_blank" rel="noopener noreferrer">Mở link QR</a></p>
        </div>
      )}
    </div>
  );
};

export default QRPayment;