export const REGIONS = [
  { value: "toshkent_shahri", label: "Toshkent shahri" },
  { value: "toshkent_viloyati", label: "Toshkent viloyati" },
  { value: "andijon", label: "Andijon viloyati" },
  { value: "buxoro", label: "Buxoro viloyati" },
  { value: "fargona", label: "Farg'ona viloyati" },
  { value: "jizzax", label: "Jizzax viloyati" },
  { value: "xorazm", label: "Xorazm viloyati" },
  { value: "namangan", label: "Namangan viloyati" },
  { value: "navoiy", label: "Navoiy viloyati" },
  { value: "qashqadaryo", label: "Qashqadaryo viloyati" },
  { value: "qoraqalpogiston", label: "Qoraqalpog'iston Respublikasi" },
  { value: "samarqand", label: "Samarqand viloyati" },
  { value: "sirdaryo", label: "Sirdaryo viloyati" },
  { value: "surxondaryo", label: "Surxondaryo viloyati" },
];

export const REGION_VALUES = REGIONS.map((r) => r.value);
export const REGION_LABELS = Object.fromEntries(
  REGIONS.map((r) => [r.value, r.label])
);