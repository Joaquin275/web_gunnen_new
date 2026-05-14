/**
 * Integración Redsys / Sabadell TPV Virtual — HMAC_SHA256_V1
 *
 * Flujo de preautorización (TransactionType = 1):
 *  1. Se envían parámetros firmados al TPV Virtual.
 *  2. El banco retiene el importe (NO cobra) hasta confirmación posterior.
 *  3. Si el cliente no se presenta, el restaurante confirma/captura (Type=3).
 *  4. Si el cliente acude correctamente, se anula la retención.
 */

import crypto from "crypto";

// ─── URLs del TPV Virtual ────────────────────────────────────────────────────

const REDSYS_URL_REAL = "https://sis.redsys.es/sis/realizarPago";
const REDSYS_URL_TEST = "https://sis-t.redsys.es:25443/sis/realizarPago";

export function getRedsysUrl(): string {
  return process.env.REDSYS_ENVIRONMENT === "test"
    ? REDSYS_URL_TEST
    : REDSYS_URL_REAL;
}

// ─── Número de pedido ────────────────────────────────────────────────────────

/**
 * Genera un Ds_Order compatible con Redsys:
 * - Entre 4 y 12 caracteres alfanuméricos
 * - Los 4 primeros DEBEN ser dígitos
 * Formato: MMDD + 4 dígitos aleatorios = 8 caracteres
 */
export function generateRedsysOrder(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${mm}${dd}${rand}`; // e.g. "05130472"
}

// ─── Firma HMAC_SHA256_V1 ────────────────────────────────────────────────────

/**
 * Paso 1: Deriva la clave por transacción usando 3DES-CBC
 * Clave = base64decode(secretKey), IV = 8 bytes a cero
 * Texto = Ds_Order rellenado con ceros hasta múltiplo de 8 bytes
 */
function deriveTransactionKey(order: string, secretKeyB64: string): Buffer {
  const keyBuffer = Buffer.from(secretKeyB64, "base64"); // 24 bytes
  const iv = Buffer.alloc(8, 0); // IV de 8 ceros

  // Padding Redsys: si la longitud ya es múltiplo de 8, añadir bloque extra.
  // Igual que el str_pad de la librería oficial PHP de Redsys.
  const blockSize = 8;
  const orderBytes = Buffer.byteLength(order, "utf8");
  const paddedLen =
    orderBytes % blockSize === 0
      ? orderBytes + blockSize
      : Math.ceil(orderBytes / blockSize) * blockSize;
  const orderPadded = Buffer.alloc(paddedLen, 0);
  Buffer.from(order, "utf8").copy(orderPadded);

  const cipher = crypto.createCipheriv("des-ede3-cbc", keyBuffer, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(orderPadded), cipher.final()]);
}

/**
 * Paso 2: Firma los Ds_MerchantParameters con HMAC-SHA256
 * usando la clave derivada por transacción
 */
export function signRedsys(
  merchantParamsB64: string,
  order: string,
  secretKey: string
): string {
  const derivedKey = deriveTransactionKey(order, secretKey);
  const hmac = crypto.createHmac("sha256", derivedKey);
  hmac.update(Buffer.from(merchantParamsB64, "ascii"));
  return hmac.digest("base64"); // Redsys acepta base64 estándar
}

/**
 * Verifica la firma recibida de Redsys en la notificación
 */
export function verifyRedsysSignature(
  merchantParamsB64: string,
  receivedSignature: string,
  order: string,
  secretKey: string
): boolean {
  const expected = signRedsys(merchantParamsB64, order, secretKey);
  // Normaliza base64url → base64 por si Redsys usa url-safe
  const normalize = (s: string) =>
    s.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  return normalize(expected) === normalize(receivedSignature);
}

// ─── Construcción del formulario ─────────────────────────────────────────────

/**
 * Parámetros de comercio para Redsys.
 * DS_MERCHANT_TRANSACTIONTYPE = "1" → PREAUTORIZACIÓN (retención, no cobro)
 */
export interface RedsysMerchantParams {
  DS_MERCHANT_AMOUNT: string;       // Importe en céntimos, sin decimales
  DS_MERCHANT_ORDER: string;        // Nº pedido único (4-12 chars, 4 primeros dígitos)
  DS_MERCHANT_MERCHANTCODE: string; // Código de comercio Sabadell
  DS_MERCHANT_CURRENCY: string;     // 978 = EUR
  DS_MERCHANT_TRANSACTIONTYPE: string; // 1 = Preautorización
  DS_MERCHANT_TERMINAL: string;     // Terminal
  DS_MERCHANT_MERCHANTURL: string;  // URL notificación servidor (MerchantURL)
  DS_MERCHANT_URLOK: string;        // Redirección si pago OK
  DS_MERCHANT_URLKO: string;        // Redirección si pago KO
  DS_MERCHANT_MERCHANTNAME?: string;
  DS_MERCHANT_PRODUCTDESCRIPTION?: string;
  DS_MERCHANT_TITULAR?: string;
}

export interface RedsysFormData {
  url: string;
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}

/**
 * Construye los datos del formulario listo para enviar al TPV Virtual.
 * Convierte los parámetros a JSON → base64 → firma con HMAC-SHA256.
 */
export function buildRedsysForm(
  params: RedsysMerchantParams,
  secretKey: string
): RedsysFormData {
  // Los parámetros se serializan a JSON y luego se codifican en base64
  const merchantParamsJson = JSON.stringify(params);
  const merchantParamsB64 = Buffer.from(merchantParamsJson).toString("base64");

  const signature = signRedsys(
    merchantParamsB64,
    params.DS_MERCHANT_ORDER,
    secretKey
  );

  return {
    url: getRedsysUrl(),
    Ds_SignatureVersion: "HMAC_SHA256_V1",
    Ds_MerchantParameters: merchantParamsB64,
    Ds_Signature: signature,
  };
}

/**
 * Decodifica y parsea Ds_MerchantParameters recibido de Redsys
 */
export function decodeMerchantParams(
  base64Params: string
): Record<string, string> {
  const json = Buffer.from(base64Params, "base64").toString("utf8");
  return JSON.parse(json);
}

// ─── Utilidades de importes ──────────────────────────────────────────────────

/**
 * Convierte euros a céntimos para Redsys (sin decimales)
 * Ejemplo: 30.50€ → 3050
 */
export function eurToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Calcula el 30% de retención en céntimos
 * Ejemplo: total = 200€ → retención = 60€ → 6000 céntimos
 */
export function calcDeposit30pctCents(totalEuros: number): number {
  return eurToCents(totalEuros * 0.3);
}

/**
 * Interpreta el código de respuesta Redsys:
 * 0000–0099 = autorizado / preautorización correcta
 */
export function isRedsysApproved(dsResponse: string): boolean {
  const code = parseInt(dsResponse || "9999", 10);
  return !isNaN(code) && code >= 0 && code <= 99;
}
