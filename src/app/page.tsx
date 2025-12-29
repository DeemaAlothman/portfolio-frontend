"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { portfolioAPI, ClientType as APIClientType, WorkType as APIWorkType } from "@/lib/services/portfolioAPI";

type ClientType = "COMPANY" | "INDIVIDUAL" | "ALL";
type WorkType = "LOGO" | "WEBSITE" | "SOCIAL_MEDIA" | "REEL" | "ALL";

// Helper function to get full image URL
const getImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  // If URL already starts with http, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, prepend API URL
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
};

interface Client {
  id: string;
  name: string;
  slug: string;
  type: "COMPANY" | "INDIVIDUAL";
  logoUrl?: string | null;
  description?: string | null;
  _count?: {
    works: number;
  };
}

interface Work {
  id: string;
  title: string;
  slug: string;
  type: "LOGO" | "WEBSITE" | "SOCIAL_MEDIA" | "REEL";
  description?: string | null;
  thumbnailUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO";
  websiteUrl?: string | null;
  category?: "INDIVIDUAL" | "CORPORATE";
  publishDate?: string | null;
  viewCount?: number | null;
  client?: {
    id: string;
    name: string;
    slug: string;
    type: "COMPANY" | "INDIVIDUAL";
    logoUrl?: string | null;
  };
  media?: Array<{
    id: string;
    fileType: "IMAGE" | "VIDEO";
    fileUrl: string;
    thumbnailUrl?: string | null;
    altText?: string | null;
    sortOrder: number;
  }>;
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState<ClientType>("ALL");
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkType>("ALL");

  useEffect(() => {
    if (clientFilter === "INDIVIDUAL") {
      loadIndividualWorks();
    } else {
      loadClients();
    }
  }, [clientFilter, workTypeFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getClients(
        clientFilter === "ALL" ? undefined : (clientFilter as APIClientType)
      );
      // التأكد من أن data هو array
      setClients(Array.isArray(data) ? data : []);
      setWorks([]);
    } catch (err) {
      console.error("Failed to load clients:", err);
      setClients([]); // إذا فشل التحميل، تعيين array فارغ
    } finally {
      setLoading(false);
    }
  };

  const loadIndividualWorks = async () => {
    try {
      setLoading(true);
      const filters: any = {
        clientType: "INDIVIDUAL"
      };

      if (workTypeFilter !== "ALL") {
        filters.type = workTypeFilter as APIWorkType;
      }

      const response = await portfolioAPI.getWorks(filters);
      // التأكد من أن response.data هو array
      setWorks(Array.isArray(response.data) ? response.data : []);
      setClients([]);
    } catch (err) {
      console.error("Failed to load works:", err);
      setWorks([]); // إذا فشل التحميل، تعيين array فارغ
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = (type: string) => {
    const labels = {
      LOGO: "شعار",
      WEBSITE: "موقع إلكتروني",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4 sm:px-6 lg:px-8 border-b-2 border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            معرض أعمالنا
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-4">
            استكشف مجموعة متنوعة من أعمالنا الإبداعية والاحترافية
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-12">
            نحن فريق Rastaka المتخصص في تقديم حلول إبداعية ومبتكرة
          </p>
        </div>
      </section>

      {/* Client Type Filter Tabs */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b-2 border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setClientFilter("ALL")}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
                clientFilter === "ALL"
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-hover scale-105"
                  : "bg-white border-2 border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setClientFilter("INDIVIDUAL")}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
                clientFilter === "INDIVIDUAL"
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-hover scale-105"
                  : "bg-white border-2 border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              👤 أعمال فردية
            </button>
            <button
              onClick={() => setClientFilter("COMPANY")}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${
                clientFilter === "COMPANY"
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-hover scale-105"
                  : "bg-white border-2 border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              🏢 أعمال الشركات
            </button>
          </div>
        </div>
      </section>

      {/* Work Type Filter for Individuals */}
      {clientFilter === "INDIVIDUAL" && (
        <section className="bg-muted/30 border-b-2 border-border sticky top-[88px] z-30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-3 justify-center">
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
                🎬 ريلز
              </button>
              <button
                onClick={() => setWorkTypeFilter("LOGO")}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  workTypeFilter === "LOGO"
                    ? "bg-primary text-white shadow-soft"
                    : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
                }`}
              >
                🎨 شعارات
              </button>
              <button
                onClick={() => setWorkTypeFilter("SOCIAL_MEDIA")}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  workTypeFilter === "SOCIAL_MEDIA"
                    ? "bg-primary text-white shadow-soft"
                    : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
                }`}
              >
                📱 سوشيال ميديا
              </button>
              <button
                onClick={() => setWorkTypeFilter("WEBSITE")}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  workTypeFilter === "WEBSITE"
                    ? "bg-primary text-white shadow-soft"
                    : "bg-white border border-border text-foreground/70 hover:border-primary hover:text-primary"
                }`}
              >
                💻 مواقع
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Clients Grid or Works Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground/60 text-lg">
                  جاري التحميل...
                </p>
              </div>
            </div>
          ) : clientFilter === "INDIVIDUAL" ? (
            // Show Individual Works Grid
            works.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">📭</div>
                <h2 className="text-3xl font-bold text-foreground/60 mb-4">
                  لا توجد أعمال فردية بعد
                </h2>
                <p className="text-foreground/40 text-lg">
                  سنضيف الأعمال الفردية قريباً
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  
                </div>

                <div className={`grid gap-8 ${
                  workTypeFilter === "REEL"
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}>
                  {works.map((work) => {
                    const cardClassName = "group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 border-2 border-border hover:border-primary flex flex-col";

                    const cardContent = (
                      <>
                        {/* Work Image/Video */}
                        <div className={`relative bg-gradient-to-br from-muted/30 to-muted/50 overflow-hidden flex items-center justify-center ${
                          work.type === "REEL" ? "aspect-[9/16]" : "h-64"
                        }`}>
                          {work.type === "REEL" && work.thumbnailUrl && (work.mediaType === "VIDEO" || work.type === "REEL") ? (
                            // For REELs, show video player
                            <video
                              src={getImageUrl(work.thumbnailUrl)}
                              controls
                              preload="metadata"
                              playsInline
                              className="w-full h-full object-cover"
                            >
                              <source src={getImageUrl(work.thumbnailUrl)} type="video/mp4" />
                              متصفحك لا يدعم تشغيل الفيديو
                            </video>
                          ) : work.thumbnailUrl ? (
                            <img
                              src={getImageUrl(work.thumbnailUrl)}
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
                        <div className="flex-grow p-4">
                          <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2">
                            {work.title}
                          </h3>

                          {/* Client/Company Name */}
                          {work.client && (
                            <p className="text-sm text-foreground/60 mb-2">
                              {work.category === "CORPORATE" ? "🏢" : "👤"} {work.client.name}
                            </p>
                          )}

                          {/* Description */}
                          {work.description && (
                            <p className="text-foreground/60 text-sm line-clamp-3 mb-3">
                              {work.description}
                            </p>
                          )}

                          {/* Website URL for WEBSITE type */}
                          {work.type === "WEBSITE" && work.websiteUrl && (
                            <a
                              href={work.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-semibold mb-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🌐 زيارة الموقع
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}

                          {/* Publish Date */}
                          {work.publishDate && (
                            <p className="text-foreground/50 text-xs mb-1">
                              📅 {new Date(work.publishDate).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          )}

                          {/* View Count */}
                          {work.viewCount !== undefined && work.viewCount !== null && work.viewCount > 0 && (
                            <p className="text-foreground/50 text-xs">
                              👁️ {work.viewCount.toLocaleString('ar-SA')} مشاهدة
                            </p>
                          )}
                        </div>
                      </>
                    );

                    // All works show details in the card itself (no link needed)
                    return (
                      <div key={work.id} className={cardClassName}>
                        {cardContent}
                      </div>
                    );
                  })}
                </div>
              </>
            )
          ) : clients.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">📭</div>
              <h2 className="text-3xl font-bold text-foreground/60 mb-4">
                لا يوجد عملاء بعد
              </h2>
              <p className="text-foreground/40 text-lg">
                سنضيف عملاءنا المميزين قريباً
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  {clientFilter === "COMPANY"
                    ? "شركاؤنا من الشركات"
                    : "جميع عملائنا"}
                </h2>
                <p className="text-xl text-foreground/60">
                  {clients.length}{" "}
                  {clients.length === 1
                    ? "عميل"
                    : clients.length === 2
                    ? "عميلان"
                    : "عملاء"}{" "}
                  {clientFilter === "COMPANY" ? "من الشركات" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.slug}`}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-500 border-2 border-border hover:border-primary transform hover:scale-105"
                  >
                    {/* Logo Container */}
                    <div className="relative h-80 bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center p-12 overflow-hidden">
                      {client.logoUrl ? (
                        <img
                          src={getImageUrl(client.logoUrl)}
                          alt={client.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-9xl group-hover:scale-110 transition-transform duration-500">
                          {client.type === "COMPANY" ? "🏢" : "👤"}
                        </div>
                      )}

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Client Info */}
                    <div className="p-8">
                      <div className="text-center mb-4">
                        <h3 className="text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {client.name}
                        </h3>
                        <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-soft">
                          {client.type === "COMPANY" ? "🏢 شركة" : "👤 عميل فردي"}
                        </span>
                      </div>

                      {/* Description */}
                      {client.description && (
                        <p className="text-foreground/70 text-center line-clamp-2 mb-6 leading-relaxed">
                          {client.description}
                        </p>
                      )}

                      {/* Works Count */}
                      {client._count && client._count.works > 0 && (
                        <div className="text-center py-4 px-4 rounded-xl bg-primary/10 mb-4">
                          <p className="text-primary font-bold text-2xl">
                            {client._count.works}
                          </p>
                          <p className="text-primary/70 text-sm mt-1">
                            {client._count.works === 1
                              ? "عمل"
                              : client._count.works === 2
                              ? "عملان"
                              : "أعمال"}
                          </p>
                        </div>
                      )}

                      {/* View Button */}
                      <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg group-hover:gap-4 transition-all">
                        <span>عرض الأعمال</span>
                        <svg
                          className="w-6 h-6 group-hover:translate-x-1 transition-transform"
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
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary/90 to-secondary">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h2 className="text-5xl font-bold mb-6">
            هل تريد أن تكون من عملائنا؟
          </h2>
          <p className="text-2xl mb-10 text-white/90 leading-relaxed">
            انضم إلى قائمة عملائنا المميزين واحصل على خدمات احترافية تليق بعلامتك
            التجارية
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/contact"
              className="px-10 py-5 bg-white text-primary rounded-full hover:bg-white/90 transition-all text-xl font-bold shadow-hover"
            >
              تواصل معنا الآن 📧
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
