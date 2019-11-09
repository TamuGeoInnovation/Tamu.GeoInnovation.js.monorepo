const OS = {
  UNKNOWN: {
    code: -1,
    name: 'Unknown'
  },
  WINDOWS_MOBILE: {
    code: 0,
    name: 'Windows Phone'
  },
  ANDROID: {
    code: 1,
    name: 'Android'
  },
  IOS: {
    code: 2,
    name: 'iOS'
  }
};

/**
 * Returns mobile OS from user agent.
 *
 * Returns:
 *
 *  - `-1` for Unknown
 *  - `0` for Windows Phone
 *  - `1` for Android
 *  - `2` for iOS
 */
export function getMobileOS(): IOperatingSystemIdentity {
  const userAgent = navigator.userAgent || navigator.vendor;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return OS.WINDOWS_MOBILE;
  }

  if (/android/i.test(userAgent)) {
    return OS.ANDROID;
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !(<IOperatingSystemWindowExt>window).MSStream) {
    return OS.IOS;
  }

  return OS.UNKNOWN;
}

export interface IOperatingSystemIdentity {
  code: number;
  name: string;
}

interface IOperatingSystemWindowExt extends Window {
  MSStream?: object;
}
