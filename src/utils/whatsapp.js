import { buildImovelPath } from "./imovelUrl.js";

export const WHATSAPP_COMERCIAL_NUMBER = "5548991576559";
export const WHATSAPP_SUPORTE_NUMBER = "5548991720855";

const WA_BASE_URL = "https://wa.me";
const SITE_BASE_URL = "https://nolaresc.com.br";

const buildWhatsAppUrl = (phoneNumber, message = "") => {
  const base = `${WA_BASE_URL}/${phoneNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
};

export const buildSupportWhatsAppUrl = () =>
  buildWhatsAppUrl(WHATSAPP_SUPORTE_NUMBER);

export const buildCommercialWhatsAppUrl = () =>
  buildWhatsAppUrl(WHATSAPP_COMERCIAL_NUMBER);

export const buildCommercialImovelWhatsAppUrl = (imovel) => {
  const imovelPath = buildImovelPath(imovel);
  const imovelUrl = `${SITE_BASE_URL}${imovelPath}`;
  const message = `Olá! Tudo bem? Vi este imóvel no site e tenho interesse. Ele ainda está disponível? ${imovelUrl}`;

  return buildWhatsAppUrl(WHATSAPP_COMERCIAL_NUMBER, message);
};
