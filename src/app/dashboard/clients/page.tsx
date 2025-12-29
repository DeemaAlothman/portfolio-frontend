"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/auth/Button";
import { clientsAPI, Client } from "@/lib/services/clientsAPI";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Link from "next/link";

function ClientsContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; client: Client | null }>({
    isOpen: false,
    client: null,
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await clientsAPI.getAll();
      // تحقق إذا البيانات array
      setClients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الشركات");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (client: Client) => {
    setDeleteModal({ isOpen: true, client });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.client) return;

    try {
      await clientsAPI.delete(deleteModal.client.id);
      setClients(clients.filter((client) => client.id !== deleteModal.client!.id));
      setDeleteModal({ isOpen: false, client: null });
    } catch (err: any) {
      setError(err.message || "فشل حذف الشركة");
      setDeleteModal({ isOpen: false, client: null });
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">الشركات</h1>
            <p className="text-foreground/60">إدارة قائمة الشركات</p>
          </div>
          <div className="w-48">
            <Link href="/dashboard/clients/new">
              <Button variant="primary">+ إضافة شركة جديدة</Button>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Clients List */}
            {clients.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-border">
                <p className="text-foreground/60 mb-4">لا يوجد شركات بعد</p>
                <Link href="/dashboard/clients/new">
                  <Button variant="primary" className="max-w-xs mx-auto">
                    إضافة أول شركة
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white rounded-lg border-2 border-border hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Logo */}
                    {(client.logo || client.logoUrl) ? (
                      <div className="aspect-square bg-secondary relative p-4">
                        <img
                          src={client.logo || client.logoUrl}
                          alt={client.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error("Logo load error:", client.logo || client.logoUrl);
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML = '<div class="aspect-square bg-secondary flex items-center justify-center"><span class="text-6xl">🏢</span></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-secondary flex items-center justify-center">
                        <span className="text-6xl">🏢</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-primary line-clamp-1 flex-1">
                          {client.name}
                        </h3>
                      </div>

                      <div className="space-y-2 mb-4">
                        {client.description && (
                          <p className="text-sm text-foreground/60 line-clamp-2">
                            {client.description}
                          </p>
                        )}
                        {client.website && (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline block truncate"
                          >
                            🌐 {client.website}
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/clients/${client.id}/edit`} className="flex-1">
                          <button className="w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm">
                            تعديل
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(client)}
                          className="px-4 py-2 rounded-lg border-2 border-error text-error hover:bg-error/10 transition-colors text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, client: null })}
        onConfirm={handleDeleteConfirm}
        title="حذف الشركة"
        message={`هل أنت متأكد من حذف الشركة "${deleteModal.client?.name}"؟\n\nملاحظة: لا يمكن حذف شركة لديها أعمال.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <ClientsContent />
    </ProtectedRoute>
  );
}
