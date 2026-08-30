import { createContext, useContext, useCallback, type ReactNode } from "react";
import en from "./en";
import fa from "./fa";
import type { AppSettings } from "@/types";

type Language = AppSettings["language"];
type Translations = typeof en;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<Language, Translations> = { en, fa } as any;

type I18nContextType = {
  lang: Language;
  t: Translations;
  dir: "ltr" | "rtl";
  setLanguage: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  t: en,
  dir: "ltr",
  setLanguage: () => {},
});

export function I18nProvider({
  children,
  language,
  onLanguageChange,
}: {
  children: ReactNode;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}) {
  const t = translations[language];
  const dir = language === "fa" ? "rtl" : "ltr";

  const setLanguage = useCallback(
    (lang: Language) => {
      document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      onLanguageChange(lang);
    },
    [onLanguageChange]
  );

  return (
    <I18nContext.Provider value={{ lang: language, t, dir, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
