"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { contactAPI, ContactSubmission } from "@/lib/services/contactAPI";

type FilterType = "all" | "unread" | "read";

function ContactSubmissionsContent() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const isRead =
        filter === "all" ? undefined : filter === "read" ? true : false;
      const response = await contactAPI.getSubmissions(isRead);
      setSubmissions(response.data);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await contactAPI.markAsRead(id);
      await loadSubmissions();
    } catch (err: any) {
      setError(err.message || "فشل تحديث الرسالة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

    try {
      await contactAPI.delete(id);
      setSelectedSubmission(null);
      await loadSubmissions();
    } catch (err: any) {
      setError(err.message || "فشل حذف الرسالة");
    }
  };

  const handleViewSubmission = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (!submission.isRead) {
      await handleMarkAsRead(submission.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const unreadCount = submissions.filter((s) => !s.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/60">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            رسائل التواصل 📧
          </h1>
          <p className="text-foreground/60">
            عرض وإدارة رسائل التواصل من العملاء ({total} رسالة)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white border-2 border-border text-foreground hover:bg-accent"
            }`}
          >
            الكل ({total})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-6 py-3 rounded-full font-medium transition-all relative ${
              filter === "unread"
                ? "bg-primary text-white"
                : "bg-white border-2 border-border text-foreground hover:bg-accent"
            }`}
          >
            غير مقروءة ({unreadCount})
            {unreadCount > 0 && filter !== "unread" && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              filter === "read"
                ? "bg-primary text-white"
                : "bg-white border-2 border-border text-foreground hover:bg-accent"
            }`}
          >
            مقروءة ({total - unreadCount})
          </button>
        </div>

        {/* Submissions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List Panel */}
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-border">
                <p className="text-foreground/60">لا توجد رسائل</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => handleViewSubmission(submission)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    submission.isRead
                      ? "bg-white border-border hover:shadow-md"
                      : "bg-primary/5 border-primary/30 hover:shadow-lg"
                  } ${
                    selectedSubmission?.id === submission.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!submission.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                        <h3 className="font-semibold text-foreground">
                          {submission.name}
                        </h3>
                      </div>
                      <p className="text-sm text-foreground/60">
                        {submission.email}
                      </p>
                    </div>
                    <span className="text-xs text-foreground/50">
                      {formatDate(submission.createdAt).split("،")[0]}
                    </span>
                  </div>

                  {submission.subject && (
                    <p className="text-sm font-medium text-primary mb-1">
                      {submission.subject}
                    </p>
                  )}

                  <p className="text-sm text-foreground/70 line-clamp-2">
                    {submission.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Details Panel */}
          <div className="sticky top-8">
            {selectedSubmission ? (
              <div className="bg-white rounded-lg border-2 border-border p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-1">
                      {selectedSubmission.name}
                    </h2>
                    <p className="text-sm text-foreground/60">
                      {formatDate(selectedSubmission.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!selectedSubmission.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(selectedSubmission.id)}
                        className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm"
                      >
                        تحديد كمقروءة
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedSubmission.id)}
                      className="px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-all text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground/60 mb-1">
                      البريد الإلكتروني
                    </label>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>

                  {/* Phone */}
                  {selectedSubmission.phone && (
                    <div>
                      <label className="block text-sm font-medium text-foreground/60 mb-1">
                        رقم الهاتف
                      </label>
                      <a
                        href={`tel:${selectedSubmission.phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedSubmission.phone}
                      </a>
                    </div>
                  )}

                  {/* Subject */}
                  {selectedSubmission.subject && (
                    <div>
                      <label className="block text-sm font-medium text-foreground/60 mb-1">
                        الموضوع
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedSubmission.subject}
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-foreground/60 mb-2">
                      الرسالة
                    </label>
                    <div className="p-4 rounded-lg bg-secondary/20 border border-border">
                      <p className="text-foreground whitespace-pre-wrap">
                        {selectedSubmission.message}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t-2 border-border">
                    <h3 className="text-sm font-medium text-foreground/60 mb-3">
                      إجراءات سريعة
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`mailto:${selectedSubmission.email}?subject=Re: ${
                          selectedSubmission.subject || "استفسارك"
                        }`}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm"
                      >
                        رد عبر البريد
                      </a>
                      {selectedSubmission.phone && (
                        <a
                          href={`tel:${selectedSubmission.phone}`}
                          className="px-4 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary/10 transition-all text-sm"
                        >
                          اتصال هاتفي
                        </a>
                      )}
                      {selectedSubmission.phone && (
                        <a
                          href={`https://wa.me/${selectedSubmission.phone.replace(
                            /[^0-9]/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg border-2 border-success text-success hover:bg-success/10 transition-all text-sm"
                        >
                          واتساب
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border-2 border-border p-12 text-center">
                <p className="text-foreground/60 text-lg">
                  اختر رسالة لعرض التفاصيل
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactSubmissionsPage() {
  return (
    <ProtectedRoute>
      <ContactSubmissionsContent />
    </ProtectedRoute>
  );
}
