export class Device {
  /**
   * Dictionary of supported device operating systems that can be
   * detected by this class.
   */
  private OS: IOperatingSystems;

  /**
   * For any given operating system, the a list of supported operations.
   *
   * Public member tests reflect on this collection to determine if the identified
   * operating system supports an operation.
   */
  private Operations: IDeviceOSOperations;

  /**
   * Identified OS at class initialization.
   */
  public identity: IDeviceOSIdentity;

  constructor() {
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

    this.Operations = {
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

  /**
   * Determines the operating system version of supported devices.
   *
   * `null` returned for any devices for which the version operation is unsupported.
   */
  public OSVersion = (): IDeviceOSVersion | null => {
    if (this.Operations[this.identity.code]) {
      return this.Operations[this.identity.code].version();
    } else {
      console.log('OS Version Identification not Supported for OS');
    }
  };

  /**
   * Tests if the application is running as a PWA or added to home screen, in which case the device
   * would report as running in "standalone" mode.
   */
  public standalone = (): boolean => {
    if (this.Operations[this.identity.code]) {
      return this.Operations[this.identity.code].standalone();
    } else {
      console.log('Device standalone not supported by device');
    }
  };

  private testOSVersion = (platform: RegExp, appVersion: RegExp): IDeviceOSVersion | null => {
    // From: https://stackoverflow.com/a/14223920/1865449
    if (platform.test(navigator.platform)) {
      const version = navigator.appVersion.match(appVersion);
      return {
        major: !isNaN(parseInt(version[1], 10)) ? parseInt(version[1], 10) : 0,
        minor: !isNaN(parseInt(version[2], 10)) ? parseInt(version[2], 10) : 0,
        patch: !isNaN(parseInt(version[3], 10)) ? parseInt(version[3], 10) : 0
      };
    } else {
      return null;
    }
  };

  /**
   * Calls the `testOSVersion` function with iOS-specific RegExp which will return iOS version.
   */
  private iOSVersion = (): IDeviceOSVersion | null => {
    return this.testOSVersion(/iP(hone|od|ad)/, /OS (\d+)_(\d+)_?(\d+)?/);
  };

  /**
   * Calls the `testOSVersion` function with Android-specific RegExp which will return Android OS version.
   */
  private androidVersion = (): IDeviceOSVersion | null => {
    return this.testOSVersion(/Android/, /Android (\d+).(\d+).?(\d+)?/);
  };

  /**
   * Called by the `standalone` public member whenever the identified device is an iOS device.
   */
  private iOSStandalone = () => {
    if (window && window.navigator && (<INavigatorExtension>window.navigator).standalone) {
      return (<INavigatorExtension>window.navigator).standalone === true;
    } else {
      return false;
    }
  };

  /**
   * Called by the `standalone` public member whenever the identified device is an Android device.
   */
  private androidStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches;
  };
}

export interface IOperatingSystems {
  [key: string]: IDeviceOSIdentity;
}

export interface IDeviceOSIdentity {
  code: number;
  name: string;
}

interface IDeviceOSOperations {
  [key: number]: {
    version?: () => IDeviceOSVersion | null;
    standalone?: () => boolean;
  };
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
