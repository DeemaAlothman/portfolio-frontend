"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Don't show footer on admin/auth pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/auth")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-background/60 text-sm">
          <p>
            © {currentYear} Rastaka - {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
