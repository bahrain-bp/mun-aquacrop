import { I18n } from 'i18n-js';

// Define translations
const translations = {
  en: {
    greeting: "Welcome to My App!",
    signup: "Signup",
    skipauth: "Skip Auth",
    phone: "Enter Phone Number:",
    name: "Enter Fullname:",
    home: "Home screen",
    loading:"Loading crops...",
    dashboard: "Dashboard",
    crop: "Crop",
    chooseloc: "Choose Location Method",
    bylocation: "By Location",
    bydropdown: "By Dropdown",
    search:"search",
    datep: "Date Planted",
    growthstage: "Growth Stage",
    date: "Select a date",
    calcbtn: "Calculate Water Need",
    selectgrowthst: "Select Growth Stage",
    s1: "Stage 1",
    s2: "Stage 2",
    s3: "Stage 3",
    selectlocation: "Select your location in Bahrain",
    rec: "Recommendation for",
    calcwaterneed: "Calculating water need...",
    totwaterneed:"Total Water Needed:"
  },
  ar: {
    greeting: "مرحبا بك في تطبيقي",
    signup: "تسجيل الدخول",
    skipauth: "تخطي التحقق",
    phone: "أدخل رقم الهاتف: ",
    name: "أدخل الاسم الكامل:",
    home: "الشاشة الرئيسية",
    loading:"تحميل المحاصيل...",
    dashboard: "شاشة التحكم",
    crop: "المحصول",
    chooseloc: "اخنر طريقة الموقع",
    bylocation: "بواسطة الموقع",
    bydropdown: "بواسطة القائمة",
    search:"بحث",
    datep: "تاريخ الزراعة",
    growthstage: "مرحلة النمو",
    date: "اختر تاريخ",
    calcbtn: "حساب احتياج الماء",
    selectgrowthst: "اختر مرحلة النمو",
    s1: "مرحلة 1",
    s2: "مرحلة 2",
    s3: "مرحلة 3",
    selectlocation: "اختر موقعك في البحرين",
    rec: "توصيةل",
    calcwaterneed: "يتم حساب احتياج الماء",
    totwaterneed:"إجمالي احتياج المياه:"
  },
};

// Create and export the I18n instance
const i18n = new I18n(translations);

// Enable fallback if a key is missing in the selected language
i18n.enableFallback = true;

// Default language
i18n.locale = 'en';

export default i18n;
