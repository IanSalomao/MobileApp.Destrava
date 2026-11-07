// Arquivo escolhido para upload (foto, documento de identidade, certificado). base64 é lido na hora
// da escolha para o envio ao Storage; uri serve para a pré-visualização.
export type PickedFile = {
  uri: string;
  base64: string;
  fileName: string;
  contentType: string;
};

/** Extensão de arquivo a partir do MIME aceito pelos buckets (image/jpeg, image/png, application/pdf). */
export function extensionForContentType(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'application/pdf') return 'pdf';
  return 'jpg';
}
