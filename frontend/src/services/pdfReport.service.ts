import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { buildPdfHtml, pdfFileName, type PdfBuildOptions } from "../utils/pdfTemplates";

export const generatePdfFromHtml = async (html: string): Promise<string> => {
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};

export const sharePdf = async (uri: string, modulo: string): Promise<void> => {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Compartir no está disponible en este dispositivo");
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: pdfFileName(modulo),
    UTI: "com.adobe.pdf",
  });
};

export const exportPdf = async (opts: PdfBuildOptions, modulo: string): Promise<void> => {
  const html = buildPdfHtml(opts);
  const uri = await generatePdfFromHtml(html);
  await sharePdf(uri, modulo);
};
