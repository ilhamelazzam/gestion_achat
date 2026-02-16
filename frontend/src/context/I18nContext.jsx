import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const translations = {
  fr: {
    "nav.dashboard": "Tableau de bord",
    "nav.users": "Utilisateurs",
    "nav.products": "Produits",
    "nav.orders": "Commandes",
    "nav.reports": "Rapports",
    "nav.settings": "Paramètres",
    "general.settings": "Paramètres Généraux",
    "general.defaultCurrency": "Devise par défaut",
    "general.language": "Langue",
    "general.timezone": "Fuseau horaire",
    "company.info": "Informations de l'Entreprise",
    "company.name": "Nom de l'entreprise",
    "company.address": "Adresse",
    "company.email": "Email",
    "company.phone": "Téléphone",
    "action.edit": "Modifier",
    "action.save": "Enregistrer",
    "action.cancel": "Annuler",
    "lang.fr": "Français",
    "lang.en": "Anglais",
    "lang.ar": "العربية",
    "currency.mad": "MAD - Dirham Marocain",
  },
  en: {
    "nav.dashboard": "Dashboard",
    "nav.users": "Users",
    "nav.products": "Products",
    "nav.orders": "Orders",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "general.settings": "General Settings",
    "general.defaultCurrency": "Default currency",
    "general.language": "Language",
    "general.timezone": "Time zone",
    "company.info": "Company Information",
    "company.name": "Company name",
    "company.address": "Address",
    "company.email": "Email",
    "company.phone": "Phone",
    "action.edit": "Edit",
    "action.save": "Save",
    "action.cancel": "Cancel",
    "lang.fr": "French",
    "lang.en": "English",
    "lang.ar": "Arabic",
    "currency.mad": "MAD - Moroccan Dirham",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.users": "المستخدمون",
    "nav.products": "المنتجات",
    "nav.orders": "الطلبات",
    "nav.reports": "التقارير",
    "nav.settings": "الإعدادات",
    "general.settings": "الإعدادات العامة",
    "general.defaultCurrency": "العملة الافتراضية",
    "general.language": "اللغة",
    "general.timezone": "المنطقة الزمنية",
    "company.info": "معلومات الشركة",
    "company.name": "اسم الشركة",
    "company.address": "العنوان",
    "company.email": "البريد الإلكتروني",
    "company.phone": "الهاتف",
    "action.edit": "تعديل",
    "action.save": "حفظ",
    "action.cancel": "إلغاء",
    "lang.fr": "الفرنسية",
    "lang.en": "الإنجليزية",
    "lang.ar": "العربية",
    "currency.mad": "MAD - الدرهم المغربي",
  },
};

const I18nContext = createContext({
  lang: "fr",
  t: (key) => key,
  setLanguage: () => {},
});

export function I18nProvider({ children, defaultLang = "fr" }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return defaultLang;
    return localStorage.getItem("app_lang") || defaultLang;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("app_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = useMemo(
    () => (key) => translations[lang]?.[key] ?? translations.fr[key] ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLanguage: setLang,
      t,
    }),
    [lang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export { translations };
