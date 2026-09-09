import { useLanguage } from "./LanguageContext";
import { en } from "./en";
import { km } from "./km";

const translations = {
  English: en,
  en: en,
  Khmer: km,
  km: km,
};

export function useTranslation() {
  let lang = "English";
  let setLang = (newLang) => {
    localStorage.setItem("appLanguage", newLang);
    window.dispatchEvent(new CustomEvent("language-change", { detail: newLang }));
  };

  try {
    const langContext = useLanguage();
    if (langContext) {
      if (langContext.language) lang = langContext.language;
      if (langContext.setLanguage) setLang = langContext.setLanguage;
    }
  } catch (e) {
    lang = localStorage.getItem("appLanguage") || "English";
  }

  const normalizedLang =
    lang.toLowerCase() === "khmer" || lang.toLowerCase() === "km"
      ? "km"
      : "en";

  const currentDictionary = translations[normalizedLang] || en;

  const t = (key) => {
    if (currentDictionary && currentDictionary[key]) {
      return currentDictionary[key];
    }
    if (en && en[key]) {
      return en[key];
    }
    return key;
  };

  return { t, language: lang, setLanguage: setLang, currentDictionary };
}

export default useTranslation;
