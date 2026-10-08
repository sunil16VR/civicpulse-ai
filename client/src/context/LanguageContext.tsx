import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    app_title: 'CivicPulse AI',
    tagline: 'Public Complaint Intelligence & Resolution',
    dashboard: 'Dashboard',
    submit_complaint: 'Submit Complaint',
    priority_queue: 'Priority Queue',
    my_complaints: 'My Complaints',
    dept_complaints: 'Department Complaints',
    officer_tasks: 'Assigned Tasks',
    command_center: 'Admin Command Center',
    map_view: 'Hotspots & Maps',
    analytics: 'Analytics & Insights',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    language_en: 'English',
    language_ta: 'தமிழ் (Tamil)',
    role_citizen: 'Citizen',
    role_officer: 'Field Officer',
    role_dept_head: 'Dept Head',
    role_admin: 'System Admin',
  },
  ta: {
    app_title: 'சிவிக்பல்ஸ் AI',
    tagline: 'பொது புகார் நுண்ணறிவு மற்றும் தீர்வு அமைப்பு',
    dashboard: 'முகப்பு',
    submit_complaint: 'புகார் அளிக்கவும்',
    priority_queue: 'முன்னுரிமை வரிசை',
    my_complaints: 'என் புகார்கள்',
    dept_complaints: 'துறை புகார்கள்',
    officer_tasks: 'ஒதுக்கப்பட்ட பணிகள்',
    command_center: 'நிர்வாக கட்டுப்பாட்டு மையம்',
    map_view: 'வரைபடம் & ஹாட்ஸ்பாட்கள்',
    analytics: 'பகுப்பாய்வு & நுண்ணறிவு',
    login: 'உள்நுழைக',
    register: 'பதிவு செய்ய',
    logout: 'வெளியேறு',
    language_en: 'English',
    language_ta: 'தமிழ் (Tamil)',
    role_citizen: 'குடிமகன்',
    role_officer: 'கள அதிகாரி',
    role_dept_head: 'துறைத் தலைவர்',
    role_admin: 'நிர்வாகி',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('civicpulse_lang');
    return (saved as Language) || 'en';
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('civicpulse_lang', lang);
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'ta' : 'en');
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
