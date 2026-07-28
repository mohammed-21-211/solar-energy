import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// --- الصفحات ---
import Home               from './pages/Home'
import Shop               from './pages/Shop'
import Calculator         from './pages/Calculator'
import Cart               from './pages/Cart'
import Login              from './pages/Login'
import Register           from './pages/Register'
import CustomerDashboard  from './pages/CustomerDashboard'
import AdminDashboard     from './pages/AdminDashboard'
import NotFound           from './pages/NotFound'

// ======================================================
// المكوّن الجذر للتطبيق — يُضبط المزودات والمسارات
// ======================================================
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>

          {/* إشعارات Toast عربية وموجهة RTL */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Tajawal, sans-serif',
                fontSize: '14px',
                direction: 'rtl',
                borderRadius: '8px',
                padding: '12px 16px',
                background: '#FFFDF8',
                color: '#1C1A17',
                border: '1px solid #E0D9CB',
                boxShadow: '0 4px 24px rgba(28, 26, 23, 0.08)',
              },
              success: { iconTheme: { primary: '#2F5B4F', secondary: '#FFFDF8' } },
              error:   { iconTheme: { primary: '#C0512F', secondary: '#FFFDF8' } },
            }}
          />

          <Routes>
            {/* ===== الصفحات العامة (مع Navbar + Footer) ===== */}
            <Route element={<Layout />}>
              <Route index           element={<Home />} />
              <Route path="shop"     element={<Shop />} />
              <Route path="calculator" element={<Calculator />} />
              <Route path="cart"     element={<Cart />} />

              {/* لوحة تحكم العميل — تتطلب تسجيل دخول */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* لوحة تحكم الأدمن — تتطلب صلاحية admin */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ===== صفحات المصادقة (بدون Navbar/Footer) ===== */}
            <Route path="login"    element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* ===== صفحة 404 ===== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
