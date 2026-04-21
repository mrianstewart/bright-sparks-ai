import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { SpeechPdfDocument } from './SpeechPdfDocument';
import type { SpeechPdfProps } from './SpeechPdfDocument';

export async function generateSpeechPdf(props: SpeechPdfProps): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(SpeechPdfDocument, props) as any;
  return pdf(element).toBlob();
}
