import * as mammoth from 'mammoth';

/**
 * Extracts plain text from a user-uploaded File object.
 * Supports: .txt, .md, .docx
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractFileText(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'txt' || ext === 'md') {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = (e) => resolve(e.target.result);
      r.onerror = reject;
      r.readAsText(file);
    });
  }

  if (ext === 'docx') {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          resolve(result.value);
        } catch {
          reject(new Error('Could not parse .docx file.'));
        }
      };
      r.onerror = reject;
      r.readAsArrayBuffer(file);
    });
  }

  throw new Error(`Unsupported file type ".${ext}". Please use .txt, .md, or .docx.`);
}
