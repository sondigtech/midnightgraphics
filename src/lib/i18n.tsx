import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "sw";

type Dict = Record<string, { en: string; sw: string }>;

const dict: Dict = {
  "nav.home": { en: "Home", sw: "Nyumbani" },
  "nav.about": { en: "About", sw: "Kuhusu" },
  "nav.services": { en: "Services", sw: "Huduma" },
  "nav.packages": { en: "Packages", sw: "Vifurushi" },
  "nav.portfolio": { en: "Portfolio", sw: "Kazi Zetu" },
  "nav.ceo": { en: "About the CEO", sw: "Kuhusu Mkurugenzi" },
  "nav.contact": { en: "Contact", sw: "Mawasiliano" },
  "cta.request": { en: "Request a Service", sw: "Omba Huduma" },
  "cta.getStarted": { en: "Get Started", sw: "Anza Sasa" },
  "cta.explore": { en: "Explore Our Work", sw: "Tazama Kazi Zetu" },
  "cta.whatsapp": { en: "Chat With Us on WhatsApp", sw: "Ongea Nasi WhatsApp" },
  "cta.requestService": { en: "Request Service", sw: "Omba Huduma" },
  "cta.requestPackage": { en: "Request This Package", sw: "Omba Kifurushi Hiki" },
  "cta.viewAll": { en: "View all", sw: "Tazama zote" },
  "cta.continueWhatsApp": { en: "Continue on WhatsApp", sw: "Endelea kwenye WhatsApp" },
  "cta.downloadCv": { en: "Download CV", sw: "Pakua CV" },
  "showcase.title": { en: "Selected Creative Work", sw: "Kazi Bunifu Zilizochaguliwa" },
  "showcase.empty": {
    en: "Portfolio projects will appear here once added from the dashboard.",
    sw: "Kazi za portfolio zitaonekana hapa mara zitakapoongezwa.",
  },
  "about.title": { en: "About Midnight Graphics", sw: "Kuhusu Midnight Graphics" },
  "about.stats.projects": { en: "Projects Completed", sw: "Kazi Zilizokamilika" },
  "about.stats.clients": { en: "Happy Clients", sw: "Wateja Walioridhika" },
  "about.stats.services": { en: "Creative Services", sw: "Huduma za Ubunifu" },
  "about.stats.years": { en: "Years of Experience", sw: "Miaka ya Uzoefu" },
  "services.title": { en: "Our Services", sw: "Huduma Zetu" },
  "services.subtitle": {
    en: "Design, print and technology services delivered with craft and care.",
    sw: "Huduma za usanifu, uchapishaji na teknolojia zinazotolewa kwa ustadi.",
  },
  "services.from": { en: "From", sw: "Kuanzia" },
  "packages.title": { en: "Packages", sw: "Vifurushi" },
  "packages.subtitle": {
    en: "Flexible bundles built around real business needs.",
    sw: "Vifurushi vinavyobadilika kulingana na mahitaji ya biashara.",
  },
  "packages.popular": { en: "Most Popular", sw: "Maarufu Zaidi" },
  "packages.onRequest": { en: "Price on request", sw: "Bei kwa mahitaji" },
  "portfolio.title": { en: "Portfolio", sw: "Kazi Zetu" },
  "portfolio.all": { en: "All", sw: "Zote" },
  "portfolio.search": { en: "Search projects...", sw: "Tafuta kazi..." },
  "portfolio.empty": { en: "No projects found.", sw: "Hakuna kazi zilizopatikana." },
  "portfolio.client": { en: "Client", sw: "Mteja" },
  "portfolio.category": { en: "Category", sw: "Aina" },
  "portfolio.date": { en: "Date", sw: "Tarehe" },
  "portfolio.tools": { en: "Tools used", sw: "Zana zilizotumika" },
  "portfolio.visit": { en: "Visit project", sw: "Tembelea kazi" },
  "portfolio.back": { en: "Back to portfolio", sw: "Rudi kwenye kazi" },
  "why.title": { en: "Why Choose Us", sw: "Kwa Nini Utuchague" },
  "tech.title": { en: "Creativity Meets Technology", sw: "Ubunifu Unakutana na Teknolojia" },
  "testimonials.title": { en: "What Clients Say", sw: "Wateja Wanasema" },
  "testimonials.empty": {
    en: "Client testimonials will appear here.",
    sw: "Maoni ya wateja yataonekana hapa.",
  },
  "ceo.title": { en: "Founder & CEO", sw: "Mwanzilishi na Mkurugenzi" },
  "ceo.bio": { en: "Professional Biography", sw: "Wasifu wa Kitaalamu" },
  "ceo.skills": { en: "Skills", sw: "Ujuzi" },
  "ceo.experience": { en: "Experience", sw: "Uzoefu" },
  "ceo.philosophy": { en: "Creative Philosophy", sw: "Falsafa ya Ubunifu" },
  "contact.title": { en: "Get in Touch", sw: "Wasiliana Nasi" },
  "contact.subtitle": {
    en: "Tell us about your project and we will reply shortly.",
    sw: "Tuambie kuhusu mradi wako na tutajibu haraka.",
  },
  "form.name": { en: "Full Name", sw: "Jina Kamili" },
  "form.email": { en: "Email", sw: "Barua Pepe" },
  "form.phone": { en: "Phone Number", sw: "Namba ya Simu" },
  "form.whatsapp": { en: "WhatsApp Number", sw: "Namba ya WhatsApp" },
  "form.subject": { en: "Subject", sw: "Somo" },
  "form.message": { en: "Message", sw: "Ujumbe" },
  "form.service": { en: "Selected Service", sw: "Huduma Iliyochaguliwa" },
  "form.description": { en: "Project Description", sw: "Maelezo ya Mradi" },
  "form.budget": { en: "Budget", sw: "Bajeti" },
  "form.deadline": { en: "Preferred Deadline", sw: "Muda Unaotarajiwa" },
  "form.company": { en: "Company / Organization", sw: "Kampuni / Taasisi" },
  "form.extra": { en: "Additional Information", sw: "Maelezo ya Ziada" },
  "form.attachment": { en: "File Attachment", sw: "Ambatisha Faili" },
  "form.optional": { en: "optional", sw: "si lazima" },
  "form.submit": { en: "Submit Request", sw: "Tuma Ombi" },
  "form.send": { en: "Send Message", sw: "Tuma Ujumbe" },
  "form.sending": { en: "Sending...", sw: "Inatuma..." },
  "form.required": { en: "This field is required", sw: "Sehemu hii inahitajika" },
  "form.invalidEmail": { en: "Enter a valid email address", sw: "Weka barua pepe sahihi" },
  "form.successRequest": {
    en: "Request received. We will contact you shortly.",
    sw: "Ombi limepokelewa. Tutawasiliana nawe hivi karibuni.",
  },
  "form.successMessage": {
    en: "Message sent. Thank you for reaching out.",
    sw: "Ujumbe umetumwa. Asante kwa kuwasiliana nasi.",
  },
  "form.error": {
    en: "Something went wrong. Please try again.",
    sw: "Kuna hitilafu. Tafadhali jaribu tena.",
  },
  "footer.tagline": {
    en: "Creative design, printing and digital technology built in Tanzania for brands that want to stand out.",
    sw: "Ubunifu wa usanifu, uchapishaji na teknolojia ya kidijitali kutoka Tanzania kwa brandi zinazotaka kuonekana.",
  },
  "footer.quickLinks": { en: "Quick Links", sw: "Viungo vya Haraka" },
  "footer.services": { en: "Services", sw: "Huduma" },
  "footer.contact": { en: "Contact", sw: "Mawasiliano" },
  "footer.rights": {
    en: "© 2026 Midnight Graphics Enterprises. All Rights Reserved.",
    sw: "© 2026 Midnight Graphics Enterprises. Haki Zote Zimehifadhiwa.",
  },
  "common.loading": { en: "Loading...", sw: "Inapakia..." },
  "common.language": { en: "Language", sw: "Lugha" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  pick: (en?: string | null, sw?: string | null) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("mg-lang");
    if (stored === "sw" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("mg-lang", l);
    document.documentElement.lang = l;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (key) => dict[key]?.[lang] ?? key,
      pick: (en, sw) => (lang === "sw" ? sw || en || "" : en || sw || ""),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
