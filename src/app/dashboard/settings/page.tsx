"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { configAPI, PortfolioConfig } from "@/lib/services/configAPI";

type SectionType = "site" | "contact" | "social" | "footer";

function SettingsContent() {
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState<SectionType>("site");

  // Form data
  const [formData, setFormData] = useState({
    // Site Info
    siteName: "",
    siteDescription: "",
    // Contact
    email: "",
    phone: "",
    address: "",
    // Social
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    whatsappNumber: "",
    // Footer
    footerText: "",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await configAPI.get();
      setConfig(data);
      setFormData({
        siteName: data.siteName || "",
        siteDescription: data.siteDescription || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        twitterUrl: data.twitterUrl || "",
        linkedinUrl: data.linkedinUrl || "",
        youtubeUrl: data.youtubeUrl || "",
        whatsappNumber: data.whatsappNumber || "",
        footerText: data.footerText || "",
      });
    } catch (err: any) {
      setError(err.message || "فشل تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await configAPI.update(formData);
      setSuccess("تم حفظ الإعدادات بنجاح!");
      await loadConfig();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">إعدادات الموقع</h1>
          <p className="text-foreground/60">
            إدارة إعدادات الموقع العامة والـ SEO ومعلومات التواصل
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-success/10 border-2 border-success/20 text-success">
            {success}
          </div>
        )}

        {/* Sections Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-border pb-2">
          <button
            onClick={() => setActiveSection("site")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "site"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            🏢 معلومات الموقع
          </button>
          <button
            onClick={() => setActiveSection("contact")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "contact"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            📞 التواصل
          </button>
          <button
            onClick={() => setActiveSection("social")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "social"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            🌐 وسائل التواصل
          </button>
          <button
            onClick={() => setActiveSection("footer")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "footer"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            📄 الفوتر
          </button>
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-lg border-2 border-border p-6">
          {/* Site Info Section */}
          {activeSection === "site" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary mb-4">
                معلومات الموقع
              </h2>
              <Input
                label="اسم الموقع *"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="Rastaka"
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  وصف الموقع
                </label>
                <textarea
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="شركة راستاكا للتصميم والتطوير الرقمي"
                  className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeSection === "contact" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary mb-4">
                معلومات التواصل
              </h2>
              <Input
                label="البريد الإلكتروني"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@rastaka.com"
              />
              <Input
                label="رقم الهاتف"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+970 599 123 456"
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  العنوان
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="رام الله، فلسطين"
                  className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Social Media Section */}
          {activeSection === "social" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary mb-4">
                روابط التواصل الاجتماعي
              </h2>
              <Input
                label="Facebook"
                name="facebookUrl"
                type="url"
                value={formData.facebookUrl}
                onChange={handleChange}
                placeholder="https://facebook.com/rastaka"
              />
              <Input
                label="Instagram"
                name="instagramUrl"
                type="url"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/rastaka"
              />
              <Input
                label="Twitter / X"
                name="twitterUrl"
                type="url"
                value={formData.twitterUrl}
                onChange={handleChange}
                placeholder="https://twitter.com/rastaka"
              />
              <Input
                label="LinkedIn"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/rastaka"
              />
              <Input
                label="YouTube"
                name="youtubeUrl"
                type="url"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/@rastaka"
              />
              <Input
                label="رقم الواتساب"
                name="whatsappNumber"
                type="tel"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="+963987654321"
              />
              <p className="text-xs text-foreground/60 -mt-2">
                ملاحظة: أدخل الرقم بصيغة دولية مع رمز الدولة (مثال: +963987654321)
              </p>
            </div>
          )}

          {/* Footer Section */}
          {activeSection === "footer" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary mb-4">
                نص الفوتر
              </h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نص حقوق النشر
                </label>
                <textarea
                  name="footerText"
                  value={formData.footerText}
                  onChange={handleChange}
                  rows={3}
                  placeholder="© 2025 Rastaka. جميع الحقوق محفوظة."
                  className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  سيظهر هذا النص في أسفل جميع صفحات الموقع
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t-2 border-border flex gap-4">
            <Button
              type="button"
              onClick={handleSave}
              loading={saving}
              variant="primary"
            >
              حفظ التغييرات
            </Button>
            <button
              type="button"
              onClick={loadConfig}
              className="px-6 py-3 rounded-full border-2 border-border text-foreground hover:bg-accent transition-all"
            >
              إلغاء التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
