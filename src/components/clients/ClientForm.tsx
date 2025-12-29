"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { clientsAPI, CreateClientData, Client } from "@/lib/services/clientsAPI";

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
    client?.logo || client?.logoUrl || "" // الباك إند يرجع logo (مش logoUrl)
  );

  const [formData, setFormData] = useState({
    name: client?.name || "",
    description: client?.description || "",
    website: client?.website || "",
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

    if (!formData.name) newErrors.name = "اسم الشركة مطلوب";
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
      setError(err.message || "فشل حفظ الشركة");
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
          label="اسم الشركة *"
          type="text"
          placeholder="مثال: شركة E-mall"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        {/* Website URL */}
        <Input
          label="رابط الموقع"
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          الوصف
        </label>
        <textarea
          placeholder="وصف مختصر عن الشركة"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
      </div>

      {/* Logo Upload */}
      <div className="pt-6 border-t-2 border-border">
        <h3 className="text-lg font-semibold text-primary mb-4">شعار الشركة (Logo)</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            رفع شعار
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
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
          {mode === "create" ? "إضافة الشركة" : "حفظ التغييرات"}
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
