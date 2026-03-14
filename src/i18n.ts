import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
const resources = {
    en: {
        translation: {
            "Welcome": "Welcome to Govamsh Care System (GCS)"
        }
    },
    hi: {
        translation: {
            "Welcome": "गोवंश केयर सिस्टम (GCS) में आपका स्वागत है"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
