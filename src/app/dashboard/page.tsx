"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/auth/Button";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-primary">لوحة التحكم</h1>
            <p className="text-foreground/60">مرحباً، {user?.name}</p>
          </div>
          <div className="w-48">
            <Button variant="secondary" onClick={handleLogout}>
              تسجيل الخروج
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border-2 border-border bg-white hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold mb-2 text-primary">معلومات الحساب</h3>
            <div className="space-y-2 text-sm text-foreground/70">
              <p><span className="text-primary font-medium">البريد:</span> {user?.email}</p>
              <p><span className="text-primary font-medium">الدور:</span> {user?.role}</p>
              <p><span className="text-primary font-medium">المعرف:</span> {user?.id}</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/works")}
            className="p-6 rounded-lg border-2 border-border bg-white hover:shadow-lg transition-all text-right"
          >
            <h3 className="text-xl font-semibold mb-2 text-primary">الأعمال 📂</h3>
            <p className="text-foreground/60 text-sm">إدارة أعمال البورتفوليو</p>
          </button>

          <button
            onClick={() => router.push("/dashboard/clients")}
            className="p-6 rounded-lg border-2 border-border bg-white hover:shadow-lg transition-all text-right"
          >
            <h3 className="text-xl font-semibold mb-2 text-primary">العملاء 👥</h3>
            <p className="text-foreground/60 text-sm">إدارة قائمة العملاء</p>
          </button>

          <button
            onClick={() => router.push("/dashboard/contact")}
            className="p-6 rounded-lg border-2 border-border bg-white hover:shadow-lg transition-all text-right"
          >
            <h3 className="text-xl font-semibold mb-2 text-primary">رسائل التواصل 📧</h3>
            <p className="text-foreground/60 text-sm">عرض وإدارة رسائل العملاء</p>
          </button>

          <button
            onClick={() => router.push("/dashboard/settings")}
            className="p-6 rounded-lg border-2 border-border bg-white hover:shadow-lg transition-all text-right"
          >
            <h3 className="text-xl font-semibold mb-2 text-primary">الإعدادات ⚙️</h3>
            <p className="text-foreground/60 text-sm">إدارة إعدادات الموقع والـ SEO</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
