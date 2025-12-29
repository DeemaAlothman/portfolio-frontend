"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { worksAPI, CreateWorkData, Work, WorkType, CategoryType } from "@/lib/services/worksAPI";
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

  // الباك إند يرجع URLs جاهزة
  const [previewUrl, setPreviewUrl] = useState<string>(work?.mediaUrl || "");
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    work?.mediaUrls || [] // معاينة الصور المتعددة
  );
  const [companies, setCompanies] = useState<Client[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await clientsAPI.getAll();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const [formData, setFormData] = useState({
    title: work?.title || "",
    description: work?.description || "",
    type: work?.type || ("LOGO" as WorkType),
    category: work?.category || ("INDIVIDUAL" as CategoryType),
    clientName: work?.clientName || "",
    companyId: work?.companyId || "",
    websiteUrl: work?.websiteUrl || "",
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

    if (!formData.title) newErrors.title = "العنوان مطلوب";

    // التحقق من نوع العميل
    if (formData.category === "INDIVIDUAL" && !formData.clientName) {
      newErrors.clientName = "اسم العميل مطلوب للأفراد";
    }
    if (formData.category === "CORPORATE" && !formData.companyId) {
      newErrors.companyId = "يجب اختيار الشركة";
    }

    // للريلز: الفيديو إلزامي عند الإنشاء
    if (formData.type === "REEL" && mode === "create" && !file) {
      newErrors.file = "يجب رفع فيديو الريلز";
      setError("يجب رفع فيديو الريلز قبل الإنشاء");
    }

    // للمواقع: رابط الزيارة إلزامي
    if (formData.type === "WEBSITE" && !formData.websiteUrl) {
      newErrors.websiteUrl = "رابط الموقع مطلوب";
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
        // للسوشال ميديا: صور متعددة
        files: formData.type === "SOCIAL_MEDIA" ? files : undefined,
        // للريلز، اللوجو، الموقع: ملف واحد
        file: formData.type !== "SOCIAL_MEDIA" ? (file || undefined) : undefined,
      };

      if (mode === "create") {
        const response = await worksAPI.create(data);
        console.log("Work created:", response.portfolioItem);
      } else if (work) {
        const response = await worksAPI.update(work.id, data);
        console.log("Work updated:", response.portfolioItem);
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
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            فئة العميل *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
            className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="INDIVIDUAL">عميل فردي</option>
            <option value="CORPORATE">شركة</option>
          </select>
        </div>

        {/* Client Name - للأفراد */}
        {formData.category === "INDIVIDUAL" && (
          <Input
            label="اسم العميل *"
            type="text"
            placeholder="أحمد محمد"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            error={errors.clientName}
          />
        )}

        {/* Company Selector - للشركات */}
        {formData.category === "CORPORATE" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              الشركة *
            </label>
            {loadingCompanies ? (
              <div className="w-full px-4 py-3 rounded-lg bg-input-bg border-2 border-border text-foreground/60">
                جاري تحميل الشركات...
              </div>
            ) : (
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">اختر الشركة</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
            {errors.companyId && (
              <p className="mt-2 text-sm text-error">{errors.companyId}</p>
            )}
            <p className="mt-1 text-sm text-foreground/60">
              ليس لديك شركة؟{" "}
              <a
                href="/dashboard/clients/new"
                target="_blank"
                className="text-primary hover:underline"
              >
                أضف شركة جديدة
              </a>
            </p>
          </div>
        )}

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

        {/* Title */}
        <Input
          label="العنوان *"
          type="text"
          placeholder="مثال: تصميم شعار شركة XYZ"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        {/* Website URL - يظهر فقط للمواقع الإلكترونية */}
        {formData.type === "WEBSITE" && (
          <Input
            label="رابط الموقع *"
            type="url"
            placeholder="https://example.com"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            error={errors.websiteUrl}
          />
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          الوصف
        </label>
        <textarea
          placeholder="وصف تفصيلي للعمل..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-32"
        />
      </div>

      {/* File Upload Section */}
      <div className="pt-6 border-t-2 border-border">
        <h3 className="text-lg font-semibold text-primary mb-4">
          {formData.type === "REEL" && "رفع الفيديو"}
          {formData.type === "LOGO" && "رفع الشعار"}
          {formData.type === "WEBSITE" && "رفع صورة الموقع"}
          {formData.type === "SOCIAL_MEDIA" && "رفع الصور (حتى 10 صور)"}
        </h3>

        {/* Single File Upload (LOGO, REEL, WEBSITE) */}
        {formData.type !== "SOCIAL_MEDIA" && (
          <div>
            <input
              type="file"
              accept={formData.type === "REEL" ? "video/*" : "image/*"}
              onChange={handleFileChange}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {errors.file && (
              <p className="mt-2 text-sm text-error">{errors.file}</p>
            )}
            {previewUrl && formData.type !== "REEL" && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-w-md h-auto rounded-lg border-2 border-border"
                />
              </div>
            )}
            {previewUrl && formData.type === "REEL" && (
              <div className="mt-4">
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-w-md h-auto rounded-lg border-2 border-border"
                />
              </div>
            )}
          </div>
        )}

        {/* Multiple Files Upload (SOCIAL_MEDIA) */}
        {formData.type === "SOCIAL_MEDIA" && (
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleFilesChange}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {errors.files && (
              <p className="mt-2 text-sm text-error">{errors.files}</p>
            )}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-error text-white p-2 rounded-full hover:bg-error/90 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t-2 border-border">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="secondary"
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {mode === "create" ? "إضافة العمل" : "حفظ التعديلات"}
        </Button>
      </div>
    </form>
  );
}
