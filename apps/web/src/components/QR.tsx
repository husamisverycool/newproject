import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QR({ value, size = 180, dark = '#000000', light = '#FFFFFF' }: { value: string; size?: number; dark?: string; light?: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    void QRCode.toString(value, { type: 'svg', margin: 2, color: { dark, light }, errorCorrectionLevel: 'M' }).then(setSvg);
  }, [value, dark, light]);
  return <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** iOS share sheet with the invite link only — no added wording (the link's page carries the group). [HIG] */
export async function shareInvite(url: string, groupName: string) {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share({ title: groupName, url });
      return 'shared';
    } catch {
      /* cancelled */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
