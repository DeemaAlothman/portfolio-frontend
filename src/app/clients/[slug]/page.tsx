"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { portfolioAPI, WorkType, Client as APIClient, Work as APIWork } from "@/lib/services/portfolioAPI";

interface ClientWithWorks extends APIClient {
  works: APIWork[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [client, setClient] = useState<ClientWithWorks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkType | "ALL">("ALL");

  useEffect(() => {
    loadClient();
  }, [slug]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getClientBySlug(slug);
      setClient(data as ClientWithWorks);
    } catch (err: any) {
      setError(err.message || "فشل تحميل بيانات العميل");
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = (type: string) => {
    const labels = {
      LOGO: "شعارات",
      WEBSITE: "مواقع",
      SOCIAL_MEDIA: "سوشيال ميديا",
      REEL: "ريلز",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getWorkTypeEmoji = (type: string) => {
    const emojis = {
      LOGO: "🎨",
      WEBSITE: "💻",
      SOCIAL_MEDIA: "📱",
      REEL: "🎬",
    };
    return emojis[type as keyof typeof emojis] || "📁";
  };

  // Filter works based on selected type
  const filteredWorks = client?.works.filter((work: APIWork) =>
    workTypeFilter === "ALL" || work.type === workTypeFilter
  ) || [];

  // Count works by type
  const workCounts = {
    LOGO: client?.works.filter((w: APIWork) => w.type === "LOGO").length || 0,
    WEBSITE: client?.works.filter((w: APIWork) => w.type === "WEBSITE").length || 0,
    SOCIAL_MEDIA: client?.works.filter((w: APIWork) => w.type === "SOCIAL_MEDIA").length || 0,
    REEL: client?.works.filter((w: APIWork) => w.type === "REEL").length || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/60">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-error mb-4">⚠️</h1>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {error || "العميل غير موجود"}
          </h2>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Client Header with Logo */}
      <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8 border-b-2 border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Client Logo */}
            {client.logoUrl && (
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-hover p-6 flex items-center justify-center flex-shrink-0">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${client.logoUrl}`}
                  alt={client.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* Client Info */}
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                خدماتنا لشركة {client.name}
              </h1>
              <p className="text-lg text-foreground/60 mb-4">
                {client.description || `مشروع ريفر للتطوير العقاري`}
              </p>
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold"
                >
                  🌐 زيارة الموقع
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Back to Clients Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l7-7-7-7" />
          </svg>
          العودة للشركات
        </Link>
      </div>

      {/* Work Type Filter Tabs */}
      <section className="bg-muted/20 border-b-2 border-border sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => setWorkTypeFilter("ALL")}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                workTypeFilter === "ALL"
                  ? "bg-primary text-white shadow-soft"
                  : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setWorkTypeFilter("REEL")}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                workTypeFilter === "REEL"
                  ? "bg-primary text-white shadow-soft"
                  : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
              }`}
            >
              🎬 ريلزات ({workCounts.REEL})
            </button>
            <button
              onClick={() => setWorkTypeFilter("LOGO")}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                workTypeFilter === "LOGO"
                  ? "bg-primary text-white shadow-soft"
                  : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
              }`}
            >
              🎨 شعارات ({workCounts.LOGO})
            </button>
            <button
              onClick={() => setWorkTypeFilter("SOCIAL_MEDIA")}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                workTypeFilter === "SOCIAL_MEDIA"
                  ? "bg-primary text-white shadow-soft"
                  : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
              }`}
            >
              📱 سوشيال ميديا ({workCounts.SOCIAL_MEDIA})
            </button>
            <button
              onClick={() => setWorkTypeFilter("WEBSITE")}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                workTypeFilter === "WEBSITE"
                  ? "bg-primary text-white shadow-soft"
                  : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
              }`}
            >
              💻 مواقع ({workCounts.WEBSITE})
            </button>
          </div>
        </div>
      </section>

      {/* Works Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredWorks.length > 0 ? (
            <div className={`grid gap-8 ${
              workTypeFilter === "REEL"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}>
              {filteredWorks.map((work: APIWork) => {
                const cardClassName = "group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 border-2 border-border hover:border-primary flex flex-col";

                const cardContent = (
                  <>
                    {/* Work Image/Video */}
                    <div className={`relative bg-gradient-to-br from-muted/30 to-muted/50 overflow-hidden flex items-center justify-center ${
                      work.type === "REEL" ? "aspect-[9/16]" : "h-64"
                    }`}>
                      {work.type === "REEL" && work.media && work.media.length > 0 ? (
                        // For REELs, show actual video player from media
                        (() => {
                          const videoMedia = work.media.find(m => m.fileType === "VIDEO");
                          return videoMedia ? (
                            <video
                              src={`${process.env.NEXT_PUBLIC_API_URL}${videoMedia.fileUrl}`}
                              poster={
                                videoMedia.thumbnailUrl
                                  ? `${process.env.NEXT_PUBLIC_API_URL}${videoMedia.thumbnailUrl}`
                                  : work.thumbnailUrl
                                  ? `${process.env.NEXT_PUBLIC_API_URL}${work.thumbnailUrl}`
                                  : undefined
                              }
                              controls
                              preload="metadata"
                              playsInline
                              className="w-full h-full object-cover"
                            >
                              <source src={`${process.env.NEXT_PUBLIC_API_URL}${videoMedia.fileUrl}`} type="video/mp4" />
                              متصفحك لا يدعم تشغيل الفيديو
                            </video>
                          ) : work.thumbnailUrl ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${work.thumbnailUrl}`}
                              alt={work.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-6xl">🎬</span>
                          );
                        })()
                      ) : work.thumbnailUrl ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${work.thumbnailUrl}`}
                          alt={work.title}
                          className="w-full h-full group-hover:scale-110 transition-transform duration-300 object-cover"
                        />
                      ) : (
                        <span className="text-6xl">
                          {getWorkTypeEmoji(work.type)}
                        </span>
                      )}

                      {/* Work Type Badge */}
                      <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-sm font-semibold text-primary shadow-soft z-10">
                        {getWorkTypeLabel(work.type)}
                      </div>
                    </div>

                    {/* Work Info */}
                    <div className={`flex-grow ${work.type === "REEL" ? "p-3" : "p-6"}`}>
                      <h3 className={`font-bold text-foreground mb-1 transition-colors ${
                        work.type === "REEL" ? "text-base line-clamp-2" : "text-2xl group-hover:text-primary"
                      }`}>
                        {work.title}
                      </h3>

                      {/* Description for REELs */}
                      {work.type === "REEL" && work.description && (
                        <p className="text-foreground/50 text-xs line-clamp-2 mb-2">
                          {work.description}
                        </p>
                      )}

                      {/* Publish Date for REELs */}
                      {work.type === "REEL" && work.publishDate && (
                        <p className="text-foreground/40 text-xs mb-1">
                          📅 {new Date(work.publishDate).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}

                      {/* View Count for REELs */}
                      {work.type === "REEL" && work.viewCount !== undefined && (
                        <p className="text-foreground/40 text-xs">
                          👁️ {work.viewCount.toLocaleString('ar-SA')} مشاهدة
                        </p>
                      )}

                      {work.type !== "REEL" && work.description && (
                        <p className="text-foreground/60 line-clamp-2 mb-4">
                          {work.description}
                        </p>
                      )}

                      {work.type !== "REEL" && (
                        <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all mt-4">
                          <span>عرض التفاصيل</span>
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                        </div>
                      )}
                    </div>
                  </>
                );

                // For REELs, use div. For non-REELs, use Link
                return work.type === "REEL" ? (
                  <div key={work.id} className={cardClassName}>
                    {cardContent}
                  </div>
                ) : (
                  <Link key={work.id} href={`/portfolio/${work.slug}`} className={cardClassName}>
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-2xl font-bold text-foreground/60 mb-2">
                لا توجد أعمال من هذا النوع
              </h3>
              <p className="text-foreground/40">
                جرب فلتر آخر لعرض الأعمال
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
