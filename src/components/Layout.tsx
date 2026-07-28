import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

// تخطيط الموقع الرئيسي — يُغلّف جميع الصفحات العامة
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
