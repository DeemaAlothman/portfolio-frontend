"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { clientsAPI, CreateClientData, Client, ClientType } from "@/lib/services/clientsAPI";

interface ClientFormProps {
  client?: Client;
  mode: "create" | "edit";
}

export default function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    client?.logoUrl ? `${process.env.NEXT_PUBLIC_API_URL}${client.logoUrl}` : ""
  );

  const [formData, setFormData] = useState({
    name: client?.name || "",
    type: client?.type || ("COMPANY" as ClientType),
    description: client?.description || "",
    websiteUrl: client?.websiteUrl || "",
    industry: client?.industry || "",
    location: client?.location || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setLogo(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "اسم العميل مطلوب";
    if (formData.name.length < 2) newErrors.name = "الاسم يجب أن يكون حرفين على الأقل";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data: CreateClientData = {
        ...formData,
        logo: logo || undefined,
      };

      if (mode === "create") {
        await clientsAPI.create(data);
      } else if (client) {
        await clientsAPI.update(client.id, data);
      }

      router.push("/dashboard/clients");
    } catch (err: any) {
      setError(err.message || "فشل حفظ العميل");
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
        {/* Name */}
        <Input
          label="اسم العميل *"
          type="text"
          placeholder="مثال: شركة XYZ"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            نوع العميل *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
            className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="COMPANY">شركة</option>
            <option value="INDIVIDUAL">فرد</option>
          </select>
        </div>

        {/* Industry */}
        <Input
          label="مجال العمل"
          type="text"
          placeholder="مثال: تكنولوجيا، صحة، تعليم"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
        />

        {/* Location */}
        <Input
          label="الموقع"
          type="text"
          placeholder="مثال: الرياض، السعودية"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />

        {/* Website URL */}
        <Input
          label="رابط الموقع"
          type="url"
          placeholder="https://example.com"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          className="md:col-span-2"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          الوصف
        </label>
        <textarea
          placeholder="وصف مختصر عن العميل"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      {/* Logo Upload */}
      <div className="pt-6 border-t-2 border-border">
        <h3 className="text-lg font-semibold text-primary mb-4">شعار العميل (Logo)</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            رفع شعار
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
          <p className="mt-2 text-sm text-foreground/60">
            يفضل استخدام صورة مربعة بخلفية شفافة (PNG)
          </p>
        </div>

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground mb-2">معاينة:</p>
            <div className="max-w-xs p-4 bg-secondary rounded-lg">
              <img
                src={previewUrl}
                alt="Logo Preview"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <Button type="submit" loading={loading} variant="primary">
          {mode === "create" ? "إضافة العميل" : "حفظ التغييرات"}
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
