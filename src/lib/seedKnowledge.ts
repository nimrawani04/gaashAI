export type KbCategory = "health" | "government" | "agriculture" | "general";

export interface KbSeed {
  title: string;
  content_kashmiri: string;
  content_english: string;
  category: KbCategory;
  source: string;
}

export const SEED_ENTRIES: KbSeed[] = [
  {
    title: "Sehat Sathi Scheme",
    content_kashmiri:
      "سیہت ساتھی اسکیم جموں و کشمیر حکومت کی مفت علاج کی سہولت چھیہ",
    content_english:
      "Sehat Sathi is a J&K government scheme providing free health treatment up to 5 lakhs per family per year at empanelled hospitals. Residents can register at their nearest health center.",
    category: "health",
    source: "jkhealth.gov.in",
  },
  {
    title: "PM Awas Yojana Kashmir",
    content_kashmiri:
      "پی ایم آواس یوجنا غریب خاندانوں کو مکان بنانے کے لیے مالی مدد دیوان چھیہ",
    content_english:
      "PM Awas Yojana provides financial assistance to economically weaker families to build or repair homes. Applications can be submitted at the Block Development Office.",
    category: "government",
    source: "pmaymis.gov.in",
  },
  {
    title: "Apple Orchard Support Scheme",
    content_kashmiri:
      "سیب باغ اسکیم کشمیری کسانوں کو سیب کاشت کے لیے مدد دیوان چھیہ",
    content_english:
      "The J&K Horticulture Department provides subsidized plants, pesticides, and training to apple orchard farmers. Contact the district horticulture officer for registration.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Emergency Numbers Kashmir",
    content_kashmiri: "ایمرجنسی نمبر: پولیس ۱۰۰، ایمبولینس ۱۰۸، فائر بریگیڈ ۱۰۱",
    content_english:
      "Emergency contact numbers in Kashmir: Police 100, Ambulance 108, Fire Brigade 101, District Hospital Srinagar 0194-2452-018.",
    category: "general",
    source: "jkpolice.gov.in",
  },
  {
    title: "Ration Card and PDS Kashmir",
    content_kashmiri:
      "راشن کارڈ سہولت: سرکاری دکانوں تھاوی سستا چاول، آٹو تے چینی ملان چھیہ",
    content_english:
      "PDS ration card holders in J&K receive subsidized rice, wheat flour, and sugar from Fair Price Shops. New ration cards can be applied for at the tehsil food supply office.",
    category: "government",
    source: "jkfcsca.gov.in",
  },
];
