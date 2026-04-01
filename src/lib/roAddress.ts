export const RO_COUNTIES = [
  "Alba",
  "Arad",
  "Arges",
  "Bacau",
  "Bihor",
  "Bistrita-Nasaud",
  "Botosani",
  "Braila",
  "Brasov",
  "Bucuresti",
  "Buzau",
  "Calarasi",
  "Caras-Severin",
  "Cluj",
  "Constanta",
  "Covasna",
  "Dambovita",
  "Dolj",
  "Galati",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomita",
  "Iasi",
  "Ilfov",
  "Maramures",
  "Mehedinti",
  "Mures",
  "Neamt",
  "Olt",
  "Prahova",
  "Salaj",
  "Satu Mare",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timis",
  "Tulcea",
  "Valcea",
  "Vaslui",
  "Vrancea",
] as const;

export type ShippingAddressDraft = {
  county: string;
  city: string;
  street: string;
  number: string;
  block?: string;
  staircase?: string;
  floor?: string;
  apartment?: string;
  postalCode: string;
  landmark?: string;
  country?: string;
};

export const normalizeRoText = (value: string) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

export const normalizeForCompare = (value: string) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

export const isBucharest = (city: string) =>
  ["bucuresti", "bucharest", "municipiul bucuresti", "mun bucuresti"].includes(
    normalizeForCompare(city),
  );

export const isValidRoPhone = (value: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return false;
  if (digits.length === 10 && digits.startsWith("0")) return true;
  if (digits.length === 11 && digits.startsWith("40")) return true;
  if (digits.length === 12 && digits.startsWith("400")) return true;
  return false;
};

export const isValidRoPostalCode = (value: string) =>
  /^\d{6}$/.test(String(value || "").trim());

export const isAddressComplete = (value: ShippingAddressDraft) => {
  return Boolean(
    normalizeRoText(value.county) &&
      normalizeRoText(value.city) &&
      normalizeRoText(value.street) &&
      normalizeRoText(value.number) &&
      isValidRoPostalCode(value.postalCode),
  );
};

export const composeAddressLine = (value: ShippingAddressDraft) => {
  const first = [normalizeRoText(value.street), normalizeRoText(value.number)]
    .filter(Boolean)
    .join(" ");
  const extras = [
    value.block ? `Bl. ${normalizeRoText(value.block)}` : "",
    value.staircase ? `Sc. ${normalizeRoText(value.staircase)}` : "",
    value.floor ? `Et. ${normalizeRoText(value.floor)}` : "",
    value.apartment ? `Ap. ${normalizeRoText(value.apartment)}` : "",
  ].filter(Boolean);
  const core = [first, ...extras].filter(Boolean).join(", ");
  const locality = [
    normalizeRoText(value.city),
    normalizeRoText(value.county),
    normalizeRoText(value.country || "Romania"),
  ]
    .filter(Boolean)
    .join(", ");
  const postal = isValidRoPostalCode(value.postalCode)
    ? `Cod postal ${normalizeRoText(value.postalCode)}`
    : "";
  const landmark = value.landmark
    ? `Reper: ${normalizeRoText(value.landmark || "")}`
    : "";
  return [core, locality, postal, landmark].filter(Boolean).join(" | ");
};

export const shortAddressSummary = (value: ShippingAddressDraft) => {
  const first = [normalizeRoText(value.street), normalizeRoText(value.number)]
    .filter(Boolean)
    .join(" ");
  const second = [normalizeRoText(value.city), normalizeRoText(value.county)]
    .filter(Boolean)
    .join(", ");
  const third = value.postalCode ? `CP ${normalizeRoText(value.postalCode)}` : "";
  return [first, second, third].filter(Boolean).join(" • ");
};
