"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/auth/Button";
import { worksAPI, Work, WorkType, CategoryType } from "@/lib/services/worksAPI";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Link from "next/link";

function WorksContent() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "" as WorkType | "",
    category: "" as CategoryType | "",
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; work: Work | null }>({
    isOpen: false,
    work: null,
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
        ...(filters.category && { category: filters.category as CategoryType }),
      });
      // تحقق إذا البيانات array
      setWorks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الأعمال");
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (work: Work) => {
    setDeleteModal({ isOpen: true, work });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.work) return;

    try {
      await worksAPI.delete(deleteModal.work.id);
      setWorks(works.filter((work) => work.id !== deleteModal.work!.id));
      setDeleteModal({ isOpen: false, work: null });
    } catch (err: any) {
      setError(err.message || "فشل حذف العمل");
      setDeleteModal({ isOpen: false, work: null });
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

  const getCategoryBadge = (category: CategoryType) => {
    const styles: Record<CategoryType, string> = {
      INDIVIDUAL: "bg-primary/20 text-primary",
      CORPORATE: "bg-accent text-foreground",
    };

    const labels: Record<CategoryType, string> = {
      INDIVIDUAL: "فرد",
      CORPORATE: "شركة",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[category]}`}>
        {labels[category]}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors font-medium mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l7-7-7-7" />
          </svg>
          العودة للداشبورد
        </Link>

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
                الفئة
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as CategoryType | "" })}
                className="w-full px-4 py-2 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
              >
                <option value="">الكل</option>
                <option value="INDIVIDUAL">أفراد</option>
                <option value="CORPORATE">شركات</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: "", category: "" })}
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
                {works.map((work) => {
                  // كل سجل الآن عنده mediaUrl واحد (الباك اند ينشئ سجل منفصل لكل ملف)
                  const isVideo = work.type === "REEL";
                  const mediaUrl = work.mediaUrl;

                  return (
                  <div
                    key={work.id}
                    className="bg-white rounded-lg border-2 border-border hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Image/Video */}
                    {mediaUrl ? (
                      <div className="bg-secondary relative">
                        {isVideo ? (
                          <video
                            src={mediaUrl}
                            controls
                            className="w-full h-auto"
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={work.title || ''}
                            className="w-full h-auto"
                            onError={(e) => {
                              console.error("Image load error:", mediaUrl);
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' font-size='48' text-anchor='middle' dy='.3em'%3E🖼️%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-secondary flex items-center justify-center">
                        <span className="text-4xl">
                          {work.type === "LOGO" && "🏷️"}
                          {work.type === "WEBSITE" && "🌐"}
                          {work.type === "SOCIAL_MEDIA" && "📱"}
                          {work.type === "REEL" && "🎬"}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        {work.title && (
                          <h3 className="text-lg font-semibold text-primary line-clamp-1">
                            {work.title}
                          </h3>
                        )}
                        {getCategoryBadge(work.category)}
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-foreground/70">
                          <span className="font-medium">النوع:</span> {getTypeLabel(work.type)}
                        </p>
                        {work.company && (
                          <p className="text-sm text-foreground/70">
                            <span className="font-medium">الشركة:</span> {work.company.name}
                          </p>
                        )}
                        {work.clientName && (
                          <p className="text-sm text-foreground/70">
                            <span className="font-medium">العميل:</span> {work.clientName}
                          </p>
                        )}
                        {work.type === "WEBSITE" && work.websiteUrl && (
                          <p className="text-sm text-foreground/70">
                            <span className="font-medium">الرابط:</span>{" "}
                            <a
                              href={work.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {work.websiteUrl}
                            </a>
                          </p>
                        )}
                        {work.description && (
                          <p className="text-sm text-foreground/60 line-clamp-2">
                            {work.description}
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
                          onClick={() => handleDeleteClick(work)}
                          className="px-4 py-2 rounded-lg border-2 border-error text-error hover:bg-error/10 transition-colors text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, work: null })}
        onConfirm={handleDeleteConfirm}
        title="حذف العمل"
        message={`هل أنت متأكد من حذف العمل "${deleteModal.work?.title || 'بدون عنوان'}"؟\n\nسيتم حذف العمل نهائياً ولا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
}

export default function WorksPage() {
  return (
    <ProtectedRoute>
      <WorksContent />
    </ProtectedRoute>
  );
}
