import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * Returns the appropriate yt-dlp executable path depending on OS (Windows or Linux/Vercel).
 * On Linux/Vercel serverless functions, /var/task is read-only, so we copy the binary to /tmp and chmod +x.
 */
export function getYtDlpBinary(): string {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    const winBin = path.join(process.cwd(), 'bin', 'yt-dlp.exe');
    return winBin;
  }

  // Linux / Vercel serverless environment
  const tmpBin = path.join(os.tmpdir(), 'yt-dlp');
  const srcBin = path.join(process.cwd(), 'bin', 'yt-dlp');

  if (!fs.existsSync(tmpBin)) {
    if (fs.existsSync(srcBin)) {
      try {
        fs.copyFileSync(srcBin, tmpBin);
        fs.chmodSync(tmpBin, '755');
      } catch (err) {
        console.error('Error copying yt-dlp to /tmp:', err);
        return srcBin;
      }
    }
  } else {
    try {
      fs.chmodSync(tmpBin, '755');
    } catch {}
  }

  return fs.existsSync(tmpBin) ? tmpBin : srcBin;
}
