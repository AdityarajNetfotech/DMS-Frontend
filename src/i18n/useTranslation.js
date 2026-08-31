import { useLanguage } from "./LanguageContext";
import { en } from "./en";
import { km } from "./km";

const translations = {
  English: en,
  Khmer: km
};

export function useTranslation() {
  const { language, setLanguage } = useLanguage();
  const t = (key) => {
    const dict = translations[language] || translations.English;
    return dict[key] || en[key] || key;
  };
  return { t, language, setLanguage };
}
