"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/auth/Button";
import { clientsAPI, Client, ClientType } from "@/lib/services/clientsAPI";
import Link from "next/link";

function ClientsContent() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ClientType | "">("");

  useEffect(() => {
    loadClients();
  }, [filter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await clientsAPI.getAll({
        ...(filter && { type: filter as ClientType }),
      });
      setClients(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل العملاء");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${name}"؟\n\nملاحظة: لا يمكن حذف عميل لديه أعمال.`)) return;

    try {
      await clientsAPI.delete(id);
      setClients(clients.filter((client) => client.id !== id));
    } catch (err: any) {
      alert(err.message || "فشل حذف العميل");
    }
  };

  const getTypeBadge = (type: ClientType) => {
    const styles: Record<ClientType, string> = {
      COMPANY: "bg-primary/20 text-primary",
      INDIVIDUAL: "bg-accent text-foreground",
    };

    const labels: Record<ClientType, string> = {
      COMPANY: "شركة",
      INDIVIDUAL: "فرد",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">العملاء</h1>
            <p className="text-foreground/60">إدارة قائمة العملاء والشركات</p>
          </div>
          <div className="w-48">
            <Link href="/dashboard/clients/new">
              <Button variant="primary">+ إضافة عميل جديد</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-border">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                نوع العميل
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ClientType | "")}
                className="w-full px-4 py-2 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
              >
                <option value="">الكل</option>
                <option value="COMPANY">شركات</option>
                <option value="INDIVIDUAL">أفراد</option>
              </select>
            </div>

            <button
              onClick={() => setFilter("")}
              className="px-6 py-2 rounded-lg border-2 border-border text-foreground hover:bg-accent transition-colors"
            >
              إعادة تعيين
            </button>
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
                <p className="text-foreground/60 mb-4">لا يوجد عملاء بعد</p>
                <Link href="/dashboard/clients/new">
                  <Button variant="primary" className="max-w-xs mx-auto">
                    إضافة أول عميل
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
                    {client.logoUrl ? (
                      <div className="aspect-square bg-secondary relative p-4">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${client.logoUrl}`}
                          alt={client.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-secondary flex items-center justify-center">
                        <span className="text-6xl">
                          {client.type === "COMPANY" ? "🏢" : "👤"}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-primary line-clamp-1 flex-1">
                          {client.name}
                        </h3>
                        {getTypeBadge(client.type)}
                      </div>

                      <div className="space-y-2 mb-4">
                        {client.industry && (
                          <p className="text-sm text-foreground/70">
                            <span className="font-medium">المجال:</span> {client.industry}
                          </p>
                        )}
                        {client.location && (
                          <p className="text-sm text-foreground/70">
                            <span className="font-medium">الموقع:</span> {client.location}
                          </p>
                        )}
                        {client.description && (
                          <p className="text-sm text-foreground/60 line-clamp-2">
                            {client.description}
                          </p>
                        )}
                        {client.websiteUrl && (
                          <a
                            href={client.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline block truncate"
                          >
                            🌐 {client.websiteUrl}
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
                          onClick={() => handleDelete(client.id, client.name)}
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
