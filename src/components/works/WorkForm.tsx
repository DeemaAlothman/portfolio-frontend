"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { worksAPI, CreateWorkData, Work, WorkType, WorkStatus } from "@/lib/services/worksAPI";
import { clientsAPI, Client } from "@/lib/services/clientsAPI";

interface WorkFormProps {
  work?: Work;
  mode: "create" | "edit";
}

export default function WorkForm({ work, mode }: WorkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]); // للصور المتعددة (سوشال ميديا)
  const [previewUrl, setPreviewUrl] = useState<string>(
    work?.media?.[0]?.fileUrl ? `${process.env.NEXT_PUBLIC_API_URL}${work.media[0].fileUrl}` : ""
  );
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // معاينة الصور المتعددة
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  const [formData, setFormData] = useState({
    clientId: work?.clientId || "",
    type: work?.type || ("LOGO" as WorkType),
    status: work?.status || ("PUBLISHED" as WorkStatus),
    title: work?.title || "",
    shortDesc: work?.shortDesc || "",
    heroSubtitle: work?.heroSubtitle || "",
    publishDate: work?.publishDate ? new Date(work.publishDate).toISOString().split("T")[0] : "",
    visitUrl: work?.visitUrl || "",
    isFeatured: work?.isFeatured || false,
    seoTitle: work?.seoTitle || "",
    seoDescription: work?.seoDescription || "",
    seoKeywords: work?.seoKeywords || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // معالجة رفع ملفات متعددة (للسوشال ميديا)
  const handleMultipleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // حد أقصى 10 صور
    if (selectedFiles.length > 10) {
      setError("يمكنك رفع 10 صور كحد أقصى");
      return;
    }

    setFiles(selectedFiles);

    // إنشاء معاينات للصور
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // حذف صورة من القائمة
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) newErrors.clientId = "معرف العميل مطلوب";
    if (!formData.title) newErrors.title = "العنوان مطلوب";

    // للريلز: الفيديو إلزامي عند الإنشاء
    if (formData.type === "REEL" && mode === "create" && !file) {
      newErrors.file = "يجب رفع فيديو الريلز";
      setError("يجب رفع فيديو الريلز قبل الإنشاء");
    }

    // للمواقع: رابط الزيارة إلزامي
    if (formData.type === "WEBSITE" && !formData.visitUrl) {
      newErrors.visitUrl = "رابط الموقع مطلوب";
      setError("يجب إضافة رابط الموقع الإلكتروني");
    }

    // للسوشال ميديا: صور متعددة إلزامية (على الأقل صورة واحدة)
    if (formData.type === "SOCIAL_MEDIA" && mode === "create" && files.length === 0) {
      newErrors.files = "يجب رفع صورة واحدة على الأقل";
      setError("يجب رفع صورة واحدة على الأقل للسوشال ميديا");
    }

    // للوجو: صورة إلزامية
    if (formData.type === "LOGO" && mode === "create" && !file) {
      newErrors.file = "يجب رفع صورة الشعار";
      setError("يجب رفع صورة الشعار");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data: CreateWorkData = {
        ...formData,
        isFeatured: formData.isFeatured,
        // للسوشال ميديا: صور متعددة
        files: formData.type === "SOCIAL_MEDIA" ? files : undefined,
        // للريلز، اللوجو، الموقع: ملف واحد
        file: formData.type !== "SOCIAL_MEDIA" ? (file || undefined) : undefined,
      };

      if (mode === "create") {
        await worksAPI.create(data);
      } else if (work) {
        await worksAPI.update(work.id, data);
      }

      router.push("/dashboard/works");
    } catch (err: any) {
      setError(err.message || "فشل حفظ العمل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            العميل *
          </label>
          {loadingClients ? (
            <div className="w-full px-4 py-3 rounded-lg bg-input-bg border-2 border-border text-foreground/60">
              جاري تحميل العملاء...
            </div>
          ) : (
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">اختر العميل</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.type === "COMPANY" ? "شركة" : "فرد"})
                </option>
              ))}
            </select>
          )}
          {errors.clientId && (
            <p className="mt-2 text-sm text-error">{errors.clientId}</p>
          )}
          <p className="mt-1 text-sm text-foreground/60">
            ليس لديك عميل؟{" "}
            <a
              href="/dashboard/clients/new"
              target="_blank"
              className="text-primary hover:underline"
            >
              أضف عميل جديد
            </a>
          </p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            نوع العمل *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkType })}
            className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="LOGO">شعار</option>
            <option value="WEBSITE">موقع ويب</option>
            <option value="SOCIAL_MEDIA">سوشال ميديا</option>
            <option value="REEL">ريل</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            الحالة *
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkStatus })}
            className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="PUBLISHED">منشور</option>
            <option value="DRAFT">مسودة</option>
            <option value="ARCHIVED">مؤرشف</option>
          </select>
        </div>

        {/* Title */}
        <Input
          label="العنوان *"
          type="text"
          placeholder="مثال: تصميم شعار شركة XYZ"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        {/* Short Description */}
        <Input
          label="وصف قصير"
          type="text"
          placeholder="وصف مختصر للعمل"
          value={formData.shortDesc}
          onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
        />

        {/* Hero Subtitle */}
        <Input
          label="العنوان الفرعي"
          type="text"
          placeholder="عنوان فرعي يظهر في الصفحة"
          value={formData.heroSubtitle}
          onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
        />

        {/* Publish Date */}
        <Input
          label="تاريخ النشر"
          type="date"
          value={formData.publishDate}
          onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
        />

        {/* Visit URL - يظهر فقط للمواقع الإلكترونية */}
        {formData.type === "WEBSITE" && (
          <Input
            label="رابط الزيارة *"
            type="url"
            placeholder="https://example.com"
            value={formData.visitUrl}
            onChange={(e) => setFormData({ ...formData, visitUrl: e.target.value })}
          />
        )}
      </div>

      {/* Featured Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isFeatured"
          checked={formData.isFeatured}
          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-foreground">
          عمل مميز (يظهر في الصفحة الرئيسية)
        </label>
      </div>

      {/* SEO Section */}
      <div className="pt-6 border-t-2 border-border">
        <h3 className="text-lg font-semibold text-primary mb-4">إعدادات SEO</h3>
        <div className="space-y-4">
          <Input
            label="عنوان SEO"
            type="text"
            placeholder="عنوان محسّن لمحركات البحث"
            value={formData.seoTitle}
            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              وصف SEO
            </label>
            <textarea
              placeholder="وصف محسّن لمحركات البحث"
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <Input
            label="كلمات مفتاحية SEO"
            type="text"
            placeholder="كلمة1, كلمة2, كلمة3"
            value={formData.seoKeywords}
            onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="pt-6 border-t-2 border-border">
        <h3 className="text-lg font-semibold text-primary mb-4">
          {formData.type === "REEL" && "فيديو الريلز"}
          {formData.type === "LOGO" && "صورة الشعار"}
          {formData.type === "WEBSITE" && "صورة الموقع (Screenshot)"}
          {formData.type === "SOCIAL_MEDIA" && "صور السوشال ميديا"}
        </h3>

        {/* رفع ملف واحد (للريلز، اللوجو، الموقع) */}
        {formData.type !== "SOCIAL_MEDIA" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {formData.type === "REEL" && "رفع فيديو *"}
              {formData.type === "LOGO" && "رفع صورة الشعار *"}
              {formData.type === "WEBSITE" && "رفع صورة *"}
            </label>
            <input
              type="file"
              accept={formData.type === "REEL" ? "video/*" : "image/*"}
              onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {formData.type === "REEL" && (
              <p className="mt-2 text-sm text-foreground/60">
                📹 قم برفع الفيديو مباشرة (حد أقصى: 100MB، مدة: 10 دقائق للرفع)
              </p>
            )}
            {formData.type === "LOGO" && (
              <p className="mt-2 text-sm text-foreground/60">
                🎨 موصى به: PNG مع خلفية شفافة، حجم 500x500 بكسل
              </p>
            )}
            {formData.type === "WEBSITE" && (
              <p className="mt-2 text-sm text-foreground/60">
                🖼️ ارفع لقطة شاشة للموقع (Screenshot)
              </p>
            )}
          </div>
        )}

        {/* رفع ملفات متعددة (للسوشال ميديا فقط) */}
        {formData.type === "SOCIAL_MEDIA" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              رفع صور متعددة * (حتى 10 صور)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleFilesChange}
              className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            <p className="mt-2 text-sm text-foreground/60">
              📸 يمكنك رفع حتى 10 صور (JPG, PNG, GIF)
            </p>
            {files.length > 0 && (
              <p className="mt-1 text-sm text-primary font-medium">
                تم اختيار {files.length} صورة
              </p>
            )}
          </div>
        )}

        {/* معاينة ملف واحد */}
        {previewUrl && formData.type !== "SOCIAL_MEDIA" && (
          <div className="mt-4">
            {formData.type === "REEL" || file?.type.startsWith("video/") ? (
              <video
                src={previewUrl}
                controls
                className="max-w-sm h-auto rounded-lg border-2 border-border"
              >
                المتصفح لا يدعم تشغيل الفيديو
              </video>
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-sm h-auto rounded-lg border-2 border-border"
              />
            )}
          </div>
        )}

        {/* معاينة الصور المتعددة */}
        {previewUrls.length > 0 && formData.type === "SOCIAL_MEDIA" && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              معاينة الصور ({previewUrls.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.type === "REEL" && !file && mode === "create" && (
          <div className="mt-4 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-medium">
              💡 نصيحة: للفيديوهات الكبيرة (أكثر من 50MB)، استخدم YouTube
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <Button type="submit" loading={loading} variant="primary">
          {mode === "create" ? "إنشاء العمل" : "حفظ التغييرات"}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full border-2 border-border text-foreground hover:bg-accent transition-all"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
