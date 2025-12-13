"use client";

import { useState, FormEvent } from "react";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { sectionsAPI, CreateSectionData, WorkSection, SectionType, getSectionTypeLabel } from "@/lib/services/sectionsAPI";

interface SectionFormProps {
  workId: string;
  section?: WorkSection;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SectionForm({ workId, section, onSuccess, onCancel }: SectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sectionType: section?.sectionType || ("OVERVIEW" as SectionType),
    title: section?.title || "",
    body: section?.body || "",
    sortOrder: section?.sortOrder?.toString() || "0",
    highlight: section?.highlight || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "العنوان مطلوب";
    if (!formData.body) newErrors.body = "المحتوى مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data: CreateSectionData = {
        sectionType: formData.sectionType,
        title: formData.title,
        body: formData.body,
        sortOrder: parseInt(formData.sortOrder),
        highlight: formData.highlight,
      };

      if (section) {
        await sectionsAPI.update(section.id, data);
      } else {
        await sectionsAPI.create(workId, data);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "فشل حفظ القسم");
    } finally {
      setLoading(false);
    }
  };

  const sectionTypes: SectionType[] = [
    "OVERVIEW",
    "GOALS",
    "PROCESS",
    "RESULTS",
    "BRAND_STORY",
    "TECH_STACK",
    "OTHER",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            نوع القسم *
          </label>
          <select
            value={formData.sectionType}
            onChange={(e) => setFormData({ ...formData, sectionType: e.target.value as SectionType })}
            className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            {sectionTypes.map((type) => (
              <option key={type} value={type}>
                {getSectionTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <Input
          label="ترتيب العرض"
          type="number"
          placeholder="0"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
        />

        {/* Title */}
        <Input
          label="عنوان القسم *"
          type="text"
          placeholder="مثال: نظرة عامة على المشروع"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          className="md:col-span-2"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          محتوى القسم *
        </label>
        <textarea
          placeholder="اكتب محتوى القسم بالتفصيل..."
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={8}
          className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
        {errors.body && (
          <p className="mt-2 text-sm text-error">{errors.body}</p>
        )}
      </div>

      {/* Highlight Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="highlight"
          checked={formData.highlight}
          onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
          className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20"
        />
        <label htmlFor="highlight" className="text-sm font-medium text-foreground">
          قسم مميز (يظهر بشكل بارز في الصفحة)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" loading={loading} variant="primary">
          {section ? "حفظ التغييرات" : "إضافة القسم"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full border-2 border-border text-foreground hover:bg-accent transition-all"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
