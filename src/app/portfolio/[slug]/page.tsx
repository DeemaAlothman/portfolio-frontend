"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { portfolioAPI, Work } from "@/lib/services/portfolioAPI";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WorkDetailPage() {
  const { locale, t } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadWork();
    }
  }, [slug]);

  const loadWork = async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getWorkBySlug(slug);
      setWork(data);
    } catch (err) {
      console.error("Failed to load work:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/60 text-lg">{t('workDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground/60 mb-4">
            العمل غير موجود
          </h1>
          <Link
            href="/"
            className="text-primary hover:underline text-lg"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const getWorkTypeLabel = (type: string) => {
    const labels = {
      LOGO: "شعار",
      WEBSITE: "موقع إلكتروني",
      SOCIAL_MEDIA: "سوشيال ميديا",
      REEL: "ريلز",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover Image */}
      <section className="relative h-[60vh] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
        {work.thumbnailUrl && (
          <div className="absolute inset-0">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${work.thumbnailUrl}`}
              alt={work.title}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block px-6 py-2 rounded-full bg-primary text-white text-sm font-semibold mb-4">
            {getWorkTypeLabel(work.type)}
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            {work.title}
          </h1>
          {work.client && (
            <p className="text-xl text-foreground/70">
              عميل: {work.client.name}
            </p>
          )}
        </div>
      </section>

      {/* Work Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Description */}
        {work.description && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t('workDetail.overview')}
            </h2>
            <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {work.description}
            </p>
          </div>
        )}

        {/* Media Gallery */}
        {work.media && work.media.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              معرض الصور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {work.media.map((media) => (
                <div
                  key={media.id}
                  className="relative bg-muted/30 rounded-2xl overflow-hidden aspect-video"
                >
                  {media.fileType === "IMAGE" ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${media.fileUrl}`}
                      alt={media.altText || work.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL}${media.fileUrl}`}
                      poster={
                        media.thumbnailUrl
                          ? `${process.env.NEXT_PUBLIC_API_URL}${media.thumbnailUrl}`
                          : undefined
                      }
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={`${process.env.NEXT_PUBLIC_API_URL}${media.fileUrl}`} type="video/mp4" />
                      {t('workDetail.videoNotSupported')}
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {work.sections && work.sections.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t('workDetail.details')}
            </h2>
            <div className="space-y-8">
              {work.sections
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((section) => (
                  <div
                    key={section.id}
                    className={`bg-white rounded-2xl p-8 border-2 ${
                      section.isHighlight
                        ? "border-primary shadow-hover"
                        : "border-border"
                    }`}
                  >
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      {section.title}
                    </h3>
                    <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-6">
                      {section.body}
                    </div>

                    {/* Section Media */}
                    {section.media && section.media.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {section.media.map((media) => (
                          <div
                            key={media.id}
                            className="relative bg-muted/30 rounded-xl overflow-hidden aspect-video"
                          >
                            {media.fileType === "IMAGE" ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${media.fileUrl}`}
                                alt={media.altText || section.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={`${process.env.NEXT_PUBLIC_API_URL}${media.fileUrl}`}
                                poster={
                                  media.thumbnailUrl
                                    ? `${process.env.NEXT_PUBLIC_API_URL}${media.thumbnailUrl}`
                                    : undefined
                                }
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full h-full object-cover"
                              >
                                <source src={`${process.env.NEXT_PUBLIC_API_URL}${media.fileUrl}`} type="video/mp4" />
                                {t('workDetail.videoNotSupported')}
                              </video>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {work.tags && work.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('workDetail.tags')}
            </h3>
            <div className="flex flex-wrap gap-3">
              {work.tags.map((tagWrapper) => (
                <span
                  key={tagWrapper.tag.id}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  #{tagWrapper.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Client Info */}
        {work.client && (
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('workDetail.client')}
            </h3>
            <div className="flex items-start gap-6">
              {work.client.logoUrl && (
                <div className="w-24 h-24 bg-white rounded-xl shadow-soft p-4 flex items-center justify-center flex-shrink-0">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${work.client.logoUrl}`}
                    alt={work.client.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h4 className="text-xl font-bold text-foreground mb-2">
                  {work.client.name}
                </h4>
                <p className="text-foreground/70 mb-2">
                  {work.client.type === "COMPANY" ? "شركة" : "عميل فردي"}
                </p>
                {work.client.website && (
                  <a
                    href={work.client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    زيارة الموقع →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-hover transition-all text-lg font-bold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
