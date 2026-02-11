"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { portfolioAPI, Client, ClientType } from "@/lib/services/portfolioAPI";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientsPage() {
  const { locale, t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ClientType | "ALL">("ALL");

  useEffect(() => {
    loadClients();
  }, [filter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getClients(
        filter === "ALL" ? undefined : filter
      );
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/60">{t('clients.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            {t('clients.title')}
          </h1>
          <p className="text-lg text-foreground/60">
            {t('clients.subtitle')} ({clients.length} {clients.length === 1 ? t('clients.client.singular') : clients.length === 2 ? t('clients.client.dual') : t('clients.client.plural')})
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              filter === "ALL"
                ? "bg-primary text-white"
                : "bg-white border-2 border-border text-foreground hover:bg-accent"
            }`}
          >
            {t('clients.filter.all')}
          </button>
          <button
            onClick={() => setFilter("COMPANY")}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              filter === "COMPANY"
                ? "bg-primary text-white"
                : "bg-white border-2 border-border text-foreground hover:bg-accent"
            }`}
          >
            {t('clients.filter.companies')}
          </button>
          <button
            onClick={() => setFilter("INDIVIDUAL")}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              filter === "INDIVIDUAL"
                ? "bg-primary text-white"
                : "bg-white border-2 border-border text-foreground hover:bg-accent"
            }`}
          >
            {t('clients.filter.individuals')}
          </button>
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-foreground/60">{t('clients.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clients.map((client: any) => (
              <Link
                key={client.id}
                href={`/clients/${client.slug}`}
                className="group bg-white rounded-2xl p-8 border-2 border-border hover:border-primary hover:shadow-hover transition-all duration-300 cursor-pointer"
              >
                {/* Logo */}
                {client.logoUrl && (
                  <div className="mb-6 h-32 flex items-center justify-center bg-muted/30 rounded-xl p-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${client.logoUrl}`}
                      alt={client.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {client.name}
                  </h3>
                  <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold mb-3">
                    {client.type === "COMPANY" ? `🏢 ${t('clients.clientType.company')}` : `👤 ${t('clients.clientType.individual')}`}
                  </span>
                  {client.industry && (
                    <p className="text-sm text-foreground/60 font-medium">
                      {client.industry}
                    </p>
                  )}
                  {client.location && (
                    <p className="text-sm text-foreground/60 mt-1">
                      📍 {client.location}
                    </p>
                  )}
                </div>

                {/* Description */}
                {client.description && (
                  <p className="text-foreground/70 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {client.description}
                  </p>
                )}

                {/* Works Count */}
                {client._count && (
                  <div className="text-center py-4 px-4 rounded-xl bg-primary/10 mb-4">
                    <p className="text-primary font-bold text-lg">
                      {client._count.works}{" "}
                      {client._count.works === 1
                        ? t('clients.work.singular')
                        : client._count.works === 2
                        ? t('clients.work.dual')
                        : t('clients.work.plural')}
                    </p>
                    <p className="text-primary/70 text-xs mt-1">
                      {t('clients.completedFor')}
                    </p>
                  </div>
                )}

                {/* View Details Indicator */}
                <div className="flex items-center justify-center text-primary font-semibold group-hover:gap-3 transition-all mt-6">
                  <span>{t('clients.viewWorks')}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${locale === 'ar' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1 rotate-180'}`}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
