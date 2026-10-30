import { Device } from './common-utils-device';
import { locationHelp } from './location-help';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1';
const IPHONE_FIREFOX =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/144.0 Mobile/15E148 Safari/605.1.15';
// An iPad asks for desktop sites by default, and then gives the same user agent as a Mac.
const IPAD_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const ANDROID_SAMSUNG =
  'Mozilla/5.0 (Linux; Android 15; SM-S921U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36';
const WINDOWS_EDGE =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0';

/**
 * A `Device` as seen by a browser with this user agent and this many touch points.
 */
function deviceWith(userAgent: string, maxTouchPoints = 0): Device {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  // jsdom may not define it, so it is set on the navigator itself rather than spied on.
  Object.defineProperty(navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });

  return new Device();
}

afterEach(() => {
  vi.restoreAllMocks();
  delete (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints;
});

describe('Device', () => {
  it.each([
    [IPHONE_SAFARI, 0, 'iOS', 'Safari'],
    [IPHONE_CHROME, 0, 'iOS', 'Chrome'],
    [IPHONE_FIREFOX, 0, 'iOS', 'Firefox'],
    [IPAD_DESKTOP, 5, 'iOS', 'Safari'],
    [ANDROID_CHROME, 0, 'Android', 'Chrome'],
    [ANDROID_SAMSUNG, 0, 'Android', 'Samsung Internet'],
    [WINDOWS_EDGE, 0, 'Unknown', 'Edge']
  ])('reads %s as %s, %s', (userAgent, touchPoints, os, browser) => {
    const device = deviceWith(userAgent as string, touchPoints as number);

    expect(device.identity.name).toBe(os);
    expect(device.browser.name).toBe(browser);
  });

  it('does not take a Mac, which has no touch screen, for an iPad', () => {
    expect(deviceWith(IPAD_DESKTOP, 0).identity.name).toBe('Unknown');
  });
});

/**
 * #2559: when location is blocked, the steps to allow it name this phone's own settings.
 */
describe('locationHelp', () => {
  it('sends Safari on an iPhone to Safari Websites, and to the site setting so Safari stops asking', () => {
    const help = locationHelp(deviceWith(IPHONE_SAFARI));

    expect(help.device).toBe('Safari on iPhone or iPad');
    expect(help.steps.join(' ')).toContain('Privacy & Security, then Location Services');
    expect(help.steps.join(' ')).toContain('Safari Websites');
    expect(help.steps.join(' ')).toContain('Website Settings');
  });

  it('gives an iPad asking for desktop sites the same steps as an iPhone', () => {
    expect(locationHelp(deviceWith(IPAD_DESKTOP, 5)).device).toBe('Safari on iPhone or iPad');
  });

  it("sends Chrome on an iPhone to Chrome's own entry in Location Services", () => {
    const help = locationHelp(deviceWith(IPHONE_CHROME));

    expect(help.device).toBe('Chrome on iPhone or iPad');
    expect(help.steps.join(' ')).toContain('tap Chrome, choose While Using the App');
    expect(help.steps.join(' ')).not.toContain('Safari');
  });

  it('names another iPhone browser in its steps', () => {
    expect(locationHelp(deviceWith(IPHONE_FIREFOX)).steps.join(' ')).toContain('tap Firefox');
  });

  it("sends Chrome on Android to the site's permissions, then to the app's", () => {
    const help = locationHelp(deviceWith(ANDROID_CHROME));

    expect(help.device).toBe('Chrome on Android');
    expect(help.steps[0]).toContain('turn on Location');
    expect(help.steps.join(' ')).toContain('left of the address bar, then Permissions');
    expect(help.steps.join(' ')).toContain('Apps, then Chrome, then Permissions, then Location');
  });

  it('names another Android browser in its steps', () => {
    const help = locationHelp(deviceWith(ANDROID_SAMSUNG));

    expect(help.device).toBe('Samsung Internet on Android');
    expect(help.steps.join(' ')).toContain('Apps, then Samsung Internet');
  });

  it('gives general steps anywhere else', () => {
    const help = locationHelp(deviceWith(WINDOWS_EDGE));

    expect(help.device).toBe('your browser');
    expect(help.steps.join(' ')).toContain('address bar');
  });
});
