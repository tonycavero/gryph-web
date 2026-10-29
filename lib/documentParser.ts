import mammoth from 'mammoth';
// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js';

export interface DocumentParseResult {
  text: string;
  wordCount: number;
  fileName: string;
}

/**
 * Extrae texto plano limpio de archivos PDF, DOCX, DOC, TXT y MD.
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<DocumentParseResult> {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  let rawText = '';

  if (extension === 'pdf' || mimeType?.includes('pdf')) {
    try {
      const pdfData = await pdf(buffer);
      rawText = pdfData.text || '';
    } catch (err: any) {
      throw new Error(`No se pudo leer el archivo PDF: ${err.message || 'formato no soportado o protegido'}`);
    }
  } else if (extension === 'docx' || mimeType?.includes('wordprocessingml')) {
    try {
      const docxData = await mammoth.extractRawText({ buffer });
      rawText = docxData.value || '';
    } catch (err: any) {
      throw new Error(`No se pudo leer el archivo DOCX: ${err.message || 'formato inválido'}`);
    }
  } else if (extension === 'doc' || mimeType?.includes('msword')) {
    // Intentar primero con mammoth por si viene con estructura zip/docx
    try {
      const docxData = await mammoth.extractRawText({ buffer });
      rawText = docxData.value || '';
    } catch {
      // Si es formato binario OLE antiguo .doc, extraer cadenas legibles de texto
      const cleanString = buffer.toString('latin1').replace(/[^\x20-\x7E\n\r\t\u00C0-\u00FF]/g, ' ');
      const words = cleanString.split(/\s+/).filter((w) => w.length > 2);
      if (words.length > 20) {
        rawText = words.join(' ');
      } else {
        throw new Error('El archivo .doc binario antiguo no contiene texto legible. Por favor guárdalo como .docx o .pdf.');
      }
    }
  } else if (['txt', 'md', 'markdown', 'csv', 'json'].includes(extension) || mimeType?.includes('text/')) {
    rawText = buffer.toString('utf-8');
  } else {
    // Intento general como texto
    rawText = buffer.toString('utf-8');
  }

  // Normalizar espacios, saltos repetidos
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 30) {
    throw new Error('El documento no contiene suficiente texto legible para armar una presentación.');
  }

  const wordCount = cleaned.split(/\s+/).length;

  return {
    text: cleaned,
    wordCount,
    fileName,
  };
}
