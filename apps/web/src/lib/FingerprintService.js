/**
 * Utility service for generating and managing device fingerprints.
 */

export const generateFingerprint = async () => {
  try {
    const components = [
      navigator.userAgent,
      window.screen.width + 'x' + window.screen.height,
      window.screen.colorDepth,
      navigator.language,
      navigator.hardwareConcurrency,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ];
    
    const rawString = components.join('|||');
    
    // Simple fast hash function (djb2) for browser fingerprinting
    let hash = 5381;
    for (let i = 0; i < rawString.length; i++) {
      hash = ((hash << 5) + hash) + rawString.charCodeAt(i);
    }
    
    return 'dev_' + Math.abs(hash).toString(16);
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return 'dev_fallback_' + Date.now().toString(16);
  }
};

export const captureDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Basic Browser Detection
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Trident') || ua.includes('MSIE')) browser = 'Internet Explorer';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  // Basic OS Detection
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('like Mac')) os = 'iOS';

  return {
    browser,
    os,
    device_name: `${os} - ${browser}`,
    userAgent: ua,
    resolution: `${window.screen.width}x${window.screen.height}`
  };
};

export const compareFingerprints = (fp1, fp2) => {
  return fp1 === fp2;
};