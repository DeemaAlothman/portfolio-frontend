"use client";

import { useState, useEffect } from "react";
import { sectionsAPI, WorkSection, SectionType, getSectionTypeLabel } from "@/lib/services/sectionsAPI";
import Button from "@/components/auth/Button";
import SectionForm from "./SectionForm";

interface SectionsManagerProps {
  workId: string;
}

export default function SectionsManager({ workId }: SectionsManagerProps) {
  const [sections, setSections] = useState<WorkSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<WorkSection | null>(null);

  useEffect(() => {
    loadSections();
  }, [workId]);

  const loadSections = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await sectionsAPI.getForWork(workId);
      setSections(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الأقسام");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف القسم "${title}"؟`)) return;

    try {
      await sectionsAPI.delete(id);
      setSections(sections.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || "فشل حذف القسم");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSection(null);
    loadSections();
  };

  const handleEdit = (section: WorkSection) => {
    setEditingSection(section);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSection(null);
  };

  const getSectionTypeIcon = (type: SectionType) => {
    const icons: Record<SectionType, string> = {
      OVERVIEW: "📋",
      GOALS: "🎯",
      PROCESS: "⚙️",
      RESULTS: "📊",
      BRAND_STORY: "✨",
      TECH_STACK: "💻",
      OTHER: "📄",
    };
    return icons[type];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">أقسام العمل</h2>
          <p className="text-foreground/60 text-sm">
            أضف أقسام تفصيلية لشرح العمل (نظرة عامة، أهداف، نتائج، إلخ)
          </p>
        </div>
        {!showForm && (
          <div className="w-48">
            <Button variant="primary" onClick={() => setShowForm(true)}>
              + إضافة قسم جديد
            </Button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border-2 border-primary p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            {editingSection ? "تعديل القسم" : "إضافة قسم جديد"}
          </h3>
          <SectionForm
            workId={workId}
            section={editingSection || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-border">
          <p className="text-foreground/60 mb-4">لا توجد أقسام بعد</p>
          {!showForm && (
            <Button variant="primary" onClick={() => setShowForm(true)} className="max-w-xs mx-auto">
              إضافة أول قسم
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg border-2 border-border p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getSectionTypeIcon(section.sectionType)}</span>
                    <h3 className="text-xl font-semibold text-primary">{section.title}</h3>
                    {section.highlight && (
                      <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        مميز
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70 mb-2">
                    {getSectionTypeLabel(section.sectionType)} • ترتيب: {section.sortOrder}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(section.id, section.title)}
                    className="px-4 py-2 rounded-lg border-2 border-error text-error hover:bg-error/10 transition-colors text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-foreground/80 whitespace-pre-wrap">{section.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
