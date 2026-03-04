import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function callClaude(system: string, userMessage: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: system,
  });

  const result = await model.generateContent(userMessage);
  return result.response.text();
}

export async function callClaudeWithPdf(
  system: string,
  userMessage: string,
  pdfBase64: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: system,
  });

  const result = await model.generateContent([
    { text: userMessage },
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64,
      },
    },
  ]);

  return result.response.text();
}
