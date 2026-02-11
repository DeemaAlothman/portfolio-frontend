"use client";

import { useState, FormEvent } from "react";
import { portfolioAPI } from "@/lib/services/portfolioAPI";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await portfolioAPI.submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject || undefined,
        message: formData.message,
      });

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || t('contact.form.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-foreground/60">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg border-2 border-border p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              {t('contact.form.title')}
            </h2>

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-success/10 border-2 border-success/20 text-success">
                {t('contact.form.success')}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('contact.form.name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('contact.form.namePlaceholder')}
                required
              />

              <Input
                label={t('contact.form.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('contact.form.emailPlaceholder')}
                required
              />

              <Input
                label={t('contact.form.phone')}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('contact.form.phonePlaceholder')}
              />

              <Input
                label={t('contact.form.subject')}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t('contact.form.subjectPlaceholder')}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                loading={submitting}
                variant="primary"
              >
                {t('contact.form.submit')}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <div className="bg-white rounded-lg border-2 border-border p-8 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {t('contact.info.title')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {t('contact.info.email')}
                    </h3>
                    <a
                      href="mailto:info@rastaka.com"
                      className="text-primary hover:underline"
                    >
                      info@rastaka.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {t('contact.info.phone')}
                    </h3>
                    <a
                      href="tel:+970599123456"
                      className="text-primary hover:underline"
                    >
                      +970 599 123 456
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {t('contact.info.address')}
                    </h3>
                    <p className="text-foreground/70">{t('contact.info.addressValue')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-primary/5 rounded-lg border-2 border-primary/20 p-8">
              <h3 className="text-xl font-bold text-primary mb-4">
                {t('contact.hours.title')}
              </h3>
              <div className="space-y-2 text-foreground/70">
                <p>{t('contact.hours.weekdays')}</p>
                <p>{t('contact.hours.weekend')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            {t('contact.quickQuestion.title')}
          </h2>
          <p className="text-lg text-foreground/60 mb-8">
            {t('contact.quickQuestion.subtitle')}
          </p>
          <a
            href="https://wa.me/970599123456"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-success text-white hover:bg-success/90 transition-all text-lg font-medium"
          >
            <span className="text-2xl">💬</span>
            {t('contact.quickQuestion.button')}
          </a>
        </div>
      </div>
    </div>
  );
}
