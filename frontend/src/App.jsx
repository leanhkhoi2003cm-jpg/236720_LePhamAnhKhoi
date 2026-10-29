import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    foodId: '',
    name: '',
    category: '',
    cuisine: '',
    ingredients: '',
    price: '',
    quantity: '',
    description: '',
    imageUrl: ''
  });

  // Fetch danh sách món ăn
  const fetchFoods = async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/foods${keyword ? `?search=${keyword}` : ''}`);
      setFoods(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối đến Backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchFoods(search);
  };

  // Thay đổi input form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      foodId: '', name: '', category: '', cuisine: '',
      ingredients: '', price: '', quantity: '', description: '', imageUrl: ''
    });
    setEditingId(null);
  };

  // Lưu món ăn (Thêm mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const payload = {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      ingredients: typeof formData.ingredients === 'string' 
        ? formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
        : formData.ingredients
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/foods/${editingId}`, payload);
        setMessage('Cập nhật món ăn thành công!');
      } else {
        await axios.post(`${API_URL}/foods`, payload);
        setMessage('Thêm món ăn thành công!');
      }
      resetForm();
      fetchFoods(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // Chọn sửa món ăn
  const handleEdit = (food) => {
    setEditingId(food._id);
    setFormData({
      foodId: food.foodId,
      name: food.name,
      category: food.category,
      cuisine: food.cuisine,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : '',
      price: food.price,
      quantity: food.quantity,
      description: food.description || '',
      imageUrl: food.imageUrl || ''
    });
  };

  // Xóa món ăn
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) return;
    setError('');
    setMessage('');
    try {
      await axios.delete(`${API_URL}/foods/${id}`);
      setMessage('Xóa món ăn thành công!');
      if (selectedFood?._id === id) setSelectedFood(null);
      fetchFoods(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa món ăn');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Hệ Thống Quản Lý Món Ăn</h2>

      {/* Thông báo */}
      {message && <p style={{ color: 'green', background: '#e6ffe6', padding: '10px', borderRadius: '4px' }}>{message}</p>}
      {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}

      {/* Form tìm kiếm */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm theo tên, loại, vùng miền..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '8px 15px' }}>Tìm kiếm</button>
        <button type="button" onClick={() => { setSearch(''); fetchFoods(''); }} style={{ padding: '8px 15px', marginLeft: '5px' }}>Đặt lại</button>
      </form>

      {/* Form Thêm/Sửa */}
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>{editingId ? 'Cập Nhật Món Ăn' : 'Thêm Món Ăn Mới'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input name="foodId" placeholder="Mã món ăn (foodId) *" value={formData.foodId} onChange={handleChange} required disabled={!!editingId} />
          <input name="name" placeholder="Tên món ăn *" value={formData.name} onChange={handleChange} required />
          <input name="category" placeholder="Loại món ăn *" value={formData.category} onChange={handleChange} required />
          <input name="cuisine" placeholder="Ẩm thực / Vùng miền *" value={formData.cuisine} onChange={handleChange} required />
          <input name="price" type="number" placeholder="Giá bán *" value={formData.price} onChange={handleChange} required />
          <input name="quantity" type="number" placeholder="Số lượng *" value={formData.quantity} onChange={handleChange} required />
          <input name="ingredients" placeholder="Nguyên liệu (ngăn cách bởi dấu phẩy)" value={formData.ingredients} onChange={handleChange} />
          <input name="imageUrl" placeholder="Link hình ảnh" value={formData.imageUrl} onChange={handleChange} />
          <textarea name="description" placeholder="Mô tả món ăn" value={formData.description} onChange={handleChange} style={{ gridColumn: 'span 2' }} />
          
          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
              {editingId ? 'Cập Nhật' : 'Thêm Mới'}
            </button>
            {editingId && <button type="button" onClick={resetForm} style={{ padding: '10px 20px' }}>Hủy Sửa</button>}
          </div>
        </form>
      </div>

      {/* Trang Thái Loading */}
      {loading && <p>Đang tải dữ liệu...</p>}

      {/* Danh sách món ăn */}
      <h3>Danh Sách Món Ăn ({foods.length})</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th>Mã</th>
            <th>Tên món</th>
            <th>Loại</th>
            <th>Vùng miền</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food._id}>
              <td>{food.foodId}</td>
              <td><b>{food.name}</b></td>
              <td>{food.category}</td>
              <td>{food.cuisine}</td>
              <td>{food.price?.toLocaleString()} VNĐ</td>
              <td>{food.quantity}</td>
              <td>
                <button onClick={() => setSelectedFood(food)} style={{ marginRight: '5px' }}>Xem</button>
                <button onClick={() => handleEdit(food)} style={{ marginRight: '5px' }}>Sửa</button>
                <button onClick={() => handleDelete(food._id)} style={{ color: 'red' }}>Xóa</button>
              </td>
            </tr>
          ))}
          {foods.length === 0 && !loading && (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không tìm thấy món ăn nào</td></tr>
          )}
        </tbody>
      </table>

      {/* Modal Chi Tiết Món Ăn */}
      {selectedFood && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
            <h3>Chi Tiết Món Ăn</h3>
            <p><b>Mã:</b> {selectedFood.foodId}</p>
            <p><b>Tên:</b> {selectedFood.name}</p>
            <p><b>Loại:</b> {selectedFood.category}</p>
            <p><b>Vùng miền:</b> {selectedFood.cuisine}</p>
            <p><b>Giá:</b> {selectedFood.price?.toLocaleString()} VNĐ</p>
            <p><b>Số lượng:</b> {selectedFood.quantity}</p>
            <p><b>Nguyên liệu:</b> {Array.isArray(selectedFood.ingredients) ? selectedFood.ingredients.join(', ') : 'N/A'}</p>
            <p><b>Mô tả:</b> {selectedFood.description || 'Không có mô tả'}</p>
            {selectedFood.imageUrl && <img src={selectedFood.imageUrl} alt={selectedFood.name} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />}
            <br /><br />
            <button onClick={() => setSelectedFood(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;