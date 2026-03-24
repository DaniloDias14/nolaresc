const normalizeSlugPart = (value, fallback) => {
  const text = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return text || fallback;
};

export const getImovelId = (imovel) => {
  const rawId = imovel?.id ?? imovel?.imovel_id;
  const parsedId =
    typeof rawId === "number" ? rawId : Number.parseInt(String(rawId), 10);

  return Number.isFinite(parsedId) ? parsedId : null;
};

export const extractImovelIdFromSlug = (slugOrId) => {
  if (slugOrId === null || slugOrId === undefined) return null;

  const rawValue = String(slugOrId).trim().toLowerCase();
  let value = rawValue;
  try {
    value = decodeURIComponent(rawValue);
  } catch {
    value = rawValue;
  }
  if (!value) return null;

  if (/^\d+$/.test(value)) {
    const id = Number.parseInt(value, 10);
    return Number.isFinite(id) ? id : null;
  }

  const match = value.match(/-(\d+)$/);
  if (!match) return null;

  const id = Number.parseInt(match[1], 10);
  return Number.isFinite(id) ? id : null;
};

export const buildImovelSlug = (imovel) => {
  const id = getImovelId(imovel);
  if (!id) return "";

  const tipoRaw = imovel?.tipo ?? imovel?.tipo_imovel;
  const cidadeRaw = imovel?.cidade;
  if (!tipoRaw || !cidadeRaw) return "";

  const tipo = normalizeSlugPart(tipoRaw, "");
  const cidade = normalizeSlugPart(cidadeRaw, "");
  if (!tipo || !cidade) return "";

  return `${tipo}-${cidade}-${id}`;
};

export const buildImovelPath = (imovel) => {
  const slug = buildImovelSlug(imovel);
  if (slug) return `/imovel/${slug}`;

  const id = getImovelId(imovel);
  if (id) return `/imovel/${id}`;

  return "/imovel";
};
