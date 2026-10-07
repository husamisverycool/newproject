import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QR({ value, size = 180, dark = '#000000', light = '#FFFFFF' }: { value: string; size?: number; dark?: string; light?: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    void QRCode.toString(value, { type: 'svg', margin: 1, color: { dark, light }, errorCorrectionLevel: 'M' }).then(setSvg);
  }, [value, dark, light]);
  return <div style={{ width: size, height: size, borderRadius: 18, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export async function shareInvite(url: string, groupName: string) {
  const text = `Join ${groupName} on roll. — one roll a week, just us.`;
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share({ title: groupName, text, url });
      return 'shared';
    } catch {
      /* cancelled */
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
