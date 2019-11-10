export class Device {
  private OS;
  private OSOperations;
  public identity: IDeviceOSIdentity;

  constructor() {
    // Supported operating systems
    this.OS = {
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

    // Supported operations
    this.OSOperations = {
      1: {
        version: this.androidVersion,
        standalone: this.androidStandalone
      },
      2: {
        version: this.iOSVersion,
        standalone: this.iOSStandalone
      }
    };

    this.identity = this.getOS();
  }

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
  private getOS = (): IDeviceOSIdentity => {
    const userAgent = navigator.userAgent || navigator.vendor;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return this.OS.WINDOWS_MOBILE;
    }

    if (/android/i.test(userAgent)) {
      return this.OS.ANDROID;
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !(<IDeviceWindowExt>window).MSStream) {
      return this.OS.IOS;
    }

    return this.OS.UNKNOWN;
  };

  public OSVersion = () => {
    if (this.OSOperations[this.identity.code]) {
      return this.OSOperations[this.identity.code].version();
    } else {
      console.log('OS Version Identification not Supported for OS');
    }
  };

  public standalone = () => {
    if (this.OSOperations[this.identity.code]) {
      return this.OSOperations[this.identity.code].standalone();
    } else {
      console.log('Device standalone not supported by device');
    }
  };

  private testOSVersion = (platformRegex, appVersionRegex): IDeviceOSVersion | null => {
    // From: https://stackoverflow.com/a/14223920/1865449
    if (platformRegex.test(navigator.platform)) {
      const version = navigator.appVersion.match(appVersionRegex);
      return {
        major: !isNaN(parseInt(version[1], 10)) ? parseInt(version[1], 10) : 0,
        minor: !isNaN(parseInt(version[2], 10)) ? parseInt(version[2], 10) : 0,
        patch: !isNaN(parseInt(version[3], 10)) ? parseInt(version[3], 10) : 0
      };
    } else {
      return null;
    }
  };

  private iOSVersion = (): IDeviceOSVersion | null => {
    return this.testOSVersion(/iP(hone|od|ad)/, /OS (\d+)_(\d+)_?(\d+)?/);
  };

  private androidVersion = (): IDeviceOSVersion | null => {
    return this.testOSVersion(/Android/, /Android (\d+).(\d+).?(\d+)?/);
  };

  private iOSStandalone = () => {
    if (window && window.navigator && (<INavigatorExtension>window.navigator).standalone) {
      return (<INavigatorExtension>window.navigator).standalone === true;
    } else {
      return false;
    }
  };

  private androidStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches;
  };
}

export interface IDeviceOSIdentity {
  code: number;
  name: string;
}

interface IDeviceOSOperations {
  version?: boolean;
  standalone?: boolean;
}

export interface IDeviceOSVersion {
  major: number;
  minor: number;
  patch: number;
}

interface IDeviceWindowExt extends Window {
  MSStream?: object;
}

interface INavigatorExtension extends Navigator {
  standalone?: boolean;
}
