"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import WorkForm from "@/components/works/WorkForm";
import SectionsManager from "@/components/works/SectionsManager";
import MediaManager from "@/components/works/MediaManager";
import { worksAPI, Work } from "@/lib/services/worksAPI";

type TabType = "basic" | "sections" | "media";

function EditWorkContent() {
  const params = useParams();
  const id = params.id as string;

  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  useEffect(() => {
    loadWork();
  }, [id]);

  const loadWork = async () => {
    try {
      setLoading(true);
      const data = await worksAPI.getById(id);
      setWork(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل العمل");
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-error/10 border-2 border-error/20 rounded-lg text-error">
          {error || "العمل غير موجود"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">تعديل العمل</h1>
          <p className="text-foreground/60">تعديل بيانات العمل: {work.title}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b-2 border-border">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "basic"
                ? "text-primary border-b-2 border-primary -mb-[2px]"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            المعلومات الأساسية
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "sections"
                ? "text-primary border-b-2 border-primary -mb-[2px]"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            أقسام العمل
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "media"
                ? "text-primary border-b-2 border-primary -mb-[2px]"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            الصور والفيديوهات
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "basic" && (
          <div className="bg-white rounded-lg border-2 border-border p-6">
            <WorkForm work={work} mode="edit" />
          </div>
        )}

        {activeTab === "sections" && (
          <div className="bg-white rounded-lg border-2 border-border p-6">
            <SectionsManager workId={id} />
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-white rounded-lg border-2 border-border p-6">
            <MediaManager workId={id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditWorkPage() {
  return (
    <ProtectedRoute>
      <EditWorkContent />
    </ProtectedRoute>
  );
}
