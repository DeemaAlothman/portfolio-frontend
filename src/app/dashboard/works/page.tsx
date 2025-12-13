"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/auth/Button";
import { worksAPI, Work, WorkType, WorkStatus } from "@/lib/services/worksAPI";
import Link from "next/link";

function WorksContent() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "" as WorkType | "",
    status: "" as WorkStatus | "",
  });

  useEffect(() => {
    loadWorks();
  }, [filters]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await worksAPI.getAll({
        ...(filters.type && { type: filters.type as WorkType }),
        ...(filters.status && { status: filters.status as WorkStatus }),
      });
      setWorks(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الأعمال");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العمل؟")) return;

    try {
      await worksAPI.delete(id);
      setWorks(works.filter((work) => work.id !== id));
    } catch (err: any) {
      alert(err.message || "فشل حذف العمل");
    }
  };

  const getTypeLabel = (type: WorkType) => {
    const labels: Record<WorkType, string> = {
      LOGO: "شعار",
      WEBSITE: "موقع ويب",
      SOCIAL_MEDIA: "سوشال ميديا",
      REEL: "ريل",
    };
    return labels[type];
  };

  const getStatusBadge = (status: WorkStatus) => {
    const styles: Record<WorkStatus, string> = {
      PUBLISHED: "bg-success/20 text-success",
      DRAFT: "bg-accent text-foreground",
      ARCHIVED: "bg-error/20 text-error",
    };

    const labels: Record<WorkStatus, string> = {
      PUBLISHED: "منشور",
      DRAFT: "مسودة",
      ARCHIVED: "مؤرشف",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">الأعمال</h1>
            <p className="text-foreground/60">إدارة أعمال البورتفوليو</p>
          </div>
          <div className="w-48">
            <Link href="/dashboard/works/new">
              <Button variant="primary">+ إضافة عمل جديد</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نوع العمل
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as WorkType | "" })}
                className="w-full px-4 py-2 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
              >
                <option value="">الكل</option>
                <option value="LOGO">شعار</option>
                <option value="WEBSITE">موقع ويب</option>
                <option value="SOCIAL_MEDIA">سوشال ميديا</option>
                <option value="REEL">ريل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                الحالة
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as WorkStatus | "" })}
                className="w-full px-4 py-2 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
              >
                <option value="">الكل</option>
                <option value="PUBLISHED">منشور</option>
                <option value="DRAFT">مسودة</option>
                <option value="ARCHIVED">مؤرشف</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: "", status: "" })}
                className="w-full px-4 py-2 rounded-lg border-2 border-border text-foreground hover:bg-accent transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
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
            {/* Works Grid */}
            {works.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-border">
                <p className="text-foreground/60 mb-4">لا توجد أعمال بعد</p>
                <Link href="/dashboard/works/new">
                  <Button variant="primary" className="max-w-xs mx-auto">
                    إضافة أول عمل
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {works.map((work) => (
                  <div
                    key={work.id}
                    className="bg-white rounded-lg border-2 border-border hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Image */}
                    {work.media && work.media.length > 0 ? (
                      <div className="aspect-video bg-secondary relative">
                        <img
                          src={`${API_BASE_URL}${work.media[0].fileUrl}`}
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-secondary flex items-center justify-center">
                        <span className="text-4xl">🖼️</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-primary line-clamp-1">
                          {work.title}
                        </h3>
                        {getStatusBadge(work.status)}
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-foreground/70">
                          <span className="font-medium">النوع:</span> {getTypeLabel(work.type)}
                        </p>
                        {work.client && (
                          <p className="text-sm text-foreground/70">
                            <span className="font-medium">العميل:</span> {work.client.name}
                          </p>
                        )}
                        {work.shortDesc && (
                          <p className="text-sm text-foreground/60 line-clamp-2">
                            {work.shortDesc}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/works/${work.id}/edit`} className="flex-1">
                          <button className="w-full px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm">
                            تعديل
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(work.id)}
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function WorksPage() {
  return (
    <ProtectedRoute>
      <WorksContent />
    </ProtectedRoute>
  );
}
