import { readFile } from 'fs/promises';
import path from 'path';

export function getPdfPath(filePath: string): string {
  return path.join(process.cwd(), 'uploads', filePath);
}

export async function getPdfBase64(filePath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), 'uploads', filePath);
  const buffer = await readFile(fullPath);
  return buffer.toString('base64');
}
