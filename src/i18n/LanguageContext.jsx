import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("appLanguage") || "English";
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("appLanguage", lang);
    // Dispatch custom event so that components that store configuration locally or have custom sync update
    window.dispatchEvent(new CustomEvent("language-change", { detail: lang }));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
