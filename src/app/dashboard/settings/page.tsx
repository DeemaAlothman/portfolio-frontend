"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { configAPI, PortfolioConfig } from "@/lib/services/configAPI";

type SectionType = "hero" | "about" | "contact" | "social" | "colors" | "seo";

function SettingsContent() {
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState<SectionType>("hero");

  // Form data
  const [formData, setFormData] = useState({
    // Hero
    heroTitle: "",
    heroSubtitle: "",
    heroDescription: "",
    // About
    aboutTitle: "",
    aboutDescription: "",
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
    // Colors
    primaryColor: "#007f7f",
    secondaryColor: "#222222",
    accentColor: "",
    // SEO
    siteName: "",
    siteDescription: "",
    siteKeywords: "",
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
        heroTitle: data.heroTitle || "",
        heroSubtitle: data.heroSubtitle || "",
        heroDescription: data.heroDescription || "",
        aboutTitle: data.aboutTitle || "",
        aboutDescription: data.aboutDescription || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        twitterUrl: data.twitterUrl || "",
        linkedinUrl: data.linkedinUrl || "",
        youtubeUrl: data.youtubeUrl || "",
        primaryColor: data.primaryColor || "#007f7f",
        secondaryColor: data.secondaryColor || "#222222",
        accentColor: data.accentColor || "",
        siteName: data.siteName || "",
        siteDescription: data.siteDescription || "",
        siteKeywords: data.siteKeywords || "",
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
            onClick={() => setActiveSection("hero")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "hero"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            🏠 الصفحة الرئيسية
          </button>
          <button
            onClick={() => setActiveSection("about")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "about"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            ℹ️ من نحن
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
            🌐 التواصل الاجتماعي
          </button>
          <button
            onClick={() => setActiveSection("colors")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "colors"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            🎨 الألوان
          </button>
          <button
            onClick={() => setActiveSection("seo")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeSection === "seo"
                ? "bg-primary text-white"
                : "bg-secondary/20 text-foreground hover:bg-secondary/40"
            }`}
          >
            🔍 SEO
          </button>
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-lg border-2 border-border p-6">
          {/* Hero Section */}
          {activeSection === "hero" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary mb-4">
                قسم الصفحة الرئيسية (Hero)
              </h2>
              <Input
                label="العنوان الرئيسي *"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                placeholder="معرض أعمالنا"
              />
              <Input
                label="العنوان الفرعي"
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                placeholder="نستعرض أفضل أعمالنا في التصميم والتطوير"
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الوصف
                </label>
                <textarea
                  name="heroDescription"
                  value={formData.heroDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="نحن فريق Rastaka المتخصص في تقديم حلول إبداعية ومبتكرة"
                  className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* About Section */}
          {activeSection === "about" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary mb-4">قسم من نحن</h2>
              <Input
                label="عنوان القسم"
                name="aboutTitle"
                value={formData.aboutTitle}
                onChange={handleChange}
                placeholder="من نحن"
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الوصف
                </label>
                <textarea
                  name="aboutDescription"
                  value={formData.aboutDescription}
                  onChange={handleChange}
                  rows={6}
                  placeholder="نحن شركة متخصصة في التصميم والتطوير الرقمي..."
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
            </div>
          )}

          {/* Colors Section */}
          {activeSection === "colors" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary mb-4">ألوان الموقع</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    اللون الأساسي *
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="w-16 h-12 rounded-lg border-2 border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryColor: e.target.value })
                      }
                      className="flex-1 px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
                      placeholder="#007f7f"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    اللون الثانوي *
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className="w-16 h-12 rounded-lg border-2 border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        setFormData({ ...formData, secondaryColor: e.target.value })
                      }
                      className="flex-1 px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
                      placeholder="#222222"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    لون إضافي
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      name="accentColor"
                      value={formData.accentColor || "#007f7f"}
                      onChange={handleChange}
                      className="w-16 h-12 rounded-lg border-2 border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) =>
                        setFormData({ ...formData, accentColor: e.target.value })
                      }
                      className="flex-1 px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
                      placeholder="#d4c5a9"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/10 border border-border">
                <p className="text-sm text-foreground/80">
                  💡 <strong>ملاحظة:</strong> تغيير الألوان هنا لن يؤثر على لوحة التحكم،
                  هذه الألوان ستستخدم في الموقع الأمامي (Frontend) فقط.
                </p>
              </div>
            </div>
          )}

          {/* SEO Section */}
          {activeSection === "seo" && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  إعدادات محركات البحث (SEO)
                </h2>
                <p className="text-sm text-foreground/60">
                  هذه الإعدادات تساعد في تحسين ظهور موقعك في نتائج البحث على Google
                  ومحركات البحث الأخرى
                </p>
              </div>

              <Input
                label="اسم الموقع (Site Name) *"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="Rastaka Portfolio"
              />
              <div className="text-xs text-foreground/60 -mt-2 mb-2">
                يظهر في عنوان المتصفح وفي نتائج البحث
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  وصف الموقع (Meta Description) *
                </label>
                <textarea
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={160}
                  placeholder="معرض أعمال شركة رستقة للتصميم والتطوير الرقمي - نقدم حلول إبداعية ومبتكرة"
                  className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-foreground/60">
                    يظهر في نتائج البحث أسفل العنوان (يفضل 150-160 حرف)
                  </p>
                  <span
                    className={`text-xs ${
                      (formData.siteDescription?.length || 0) > 160
                        ? "text-error"
                        : "text-foreground/60"
                    }`}
                  >
                    {formData.siteDescription?.length || 0} / 160
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الكلمات المفتاحية (Keywords)
                </label>
                <textarea
                  name="siteKeywords"
                  value={formData.siteKeywords}
                  onChange={handleChange}
                  rows={3}
                  placeholder="تصميم, تطوير, برمجة, مواقع, تطبيقات, فلسطين, رام الله"
                  className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  افصل الكلمات بفاصلة (،) - مثال: تصميم, تطوير, برمجة
                </p>
              </div>

              {/* SEO Tips */}
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-primary mb-3">
                  💡 نصائح لتحسين SEO:
                </h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      استخدم عنوان موقع واضح ومميز (50-60 حرف)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      اكتب وصف جذاب يشجع على النقر (150-160 حرف)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      اختر كلمات مفتاحية ذات صلة بخدماتك (5-10 كلمات)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      تأكد من إضافة معلومات التواصل للظهور في البحث المحلي
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      استخدم أسماء ملفات واضحة للصور وأضف Alt Text
                    </span>
                  </li>
                </ul>
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
