import { Device } from './common-utils-device';

/**
 * How to let a site use this device's location again after it was blocked, in the words of the
 * device's own settings (#2559).
 */
export interface LocationHelp {
  /**
   * The browser and device the steps are for, for example "Safari on iPhone or iPad", to follow "To allow it in".
   */
  device: string;

  /**
   * What to do, in order.
   */
  steps: Array<string>;
}

const ANDROID = 1;
const IOS = 2;

const SAFARI = 0;
const CHROME = 1;

/**
 * The steps that let a blocked site use the location again on this device and browser. The caller
 * adds what to do afterwards, such as pressing a button again.
 */
export function locationHelp(device: Pick<Device, 'identity' | 'browser'> = new Device()): LocationHelp {
  const os = device.identity?.code;
  const browser = device.browser?.code;
  const known = browser !== undefined && browser >= 0;
  const browserName = known ? device.browser.name : 'your browser';

  if (os === IOS) {
    // Every browser on iOS needs Location Services, and its own entry in that list.
    const locationServices = 'Open Settings, then Privacy & Security, then Location Services, and turn Location Services on.';

    if (browser === SAFARI) {
      return {
        device: 'Safari on iPhone or iPad',
        steps: [
          locationServices,
          'In the same list, tap Safari Websites, choose While Using the App, and turn on Precise Location.',
          'Back in Safari, tap the page menu in the address bar, then Website Settings, and set Location to Allow, so Safari stops asking.'
        ]
      };
    }

    return {
      device: `${browserName} on iPhone or iPad`,
      steps: [
        locationServices,
        `In the same list, tap ${browserName}, choose While Using the App, and turn on Precise Location.`,
        `Back in ${browserName}, choose Allow when it asks to use your location.`
      ]
    };
  }

  if (os === ANDROID) {
    const locationOn = 'Swipe down from the top of the screen and turn on Location.';

    if (browser === CHROME) {
      return {
        device: 'Chrome on Android',
        steps: [
          locationOn,
          'In Chrome, tap the icon at the left of the address bar, then Permissions, and turn Location on.',
          'If Location is not listed there, open Settings, then Apps, then Chrome, then Permissions, then Location, and choose Allow only while using the app.'
        ]
      };
    }

    return {
      device: `${browserName} on Android`,
      steps: [
        locationOn,
        `Open Settings, then Apps, then ${browserName}, then Permissions, then Location, and choose Allow only while using the app.`,
        `In ${browserName}, open this site's settings and allow Location.`
      ]
    };
  }

  return {
    device: 'your browser',
    steps: [
      "Tap or click the icon at the left of the address bar, open this site's permissions, and allow Location.",
      "Make sure Location is on in your device's settings."
    ]
  };
}
