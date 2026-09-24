// تصنيفات فرعية ثابتة للريلات والتصاميم - مخزنة بحقل tag الموجود أصلاً (بدون أي تعديل على قاعدة البيانات)
export const REEL_CATEGORIES = [
  "برنامج رستقة",
  "مونتاج عقاري",
  "ذكاء صناعي",
  "ريلات اعلانية",
  "مطاعم",
  "ديكور",
  "أفلام قصيرة",
  "برومو",
  "ريلات محتوى",
  "موشن",
  "أخرى",
] as const;

export const DESIGN_CATEGORIES = [
  "أدلة تدريبية",
  "اعلانات طرقية",
  "ملفات شركات",
  "مطبوعات",
  "منتجات",
  "سوشال ميديا",
  "هوية بصرية",
  "أخرى",
] as const;

export const OTHER_CATEGORY = "أخرى";

const REEL_SPECIFIC = REEL_CATEGORIES.filter((c) => c !== OTHER_CATEGORY) as readonly string[];
const DESIGN_SPECIFIC = DESIGN_CATEGORIES.filter((c) => c !== OTHER_CATEGORY) as readonly string[];

// "أخرى" بتشمل: بدون تصنيف، أو أي وسم قديم مش من القائمة الرسمية الجديدة (مثلاً وسوم حرة قديمة قبل هالميزة)
export const matchesCategory = (
  workTag: string | null | undefined,
  category: string,
  workType: "REEL" | "DESIGN"
): boolean => {
  const specific = workType === "REEL" ? REEL_SPECIFIC : DESIGN_SPECIFIC;
  if (category === OTHER_CATEGORY) {
    return !workTag || !specific.includes(workTag);
  }
  return workTag === category;
};
