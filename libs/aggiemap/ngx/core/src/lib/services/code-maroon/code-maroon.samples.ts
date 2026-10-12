import { CodeMaroonAlert } from './code-maroon.types';

/**
 * Sample alerts, for demonstrating the map while the real feed is empty - which is its normal state
 * between emergencies (#1289).
 *
 * **Every title begins with "SAMPLE".** The overlay marks them as well, and the route is
 * development-only, but the text itself says so too: fabricated emergency wording that could be
 * screenshotted, forwarded or mistaken for a real alert is a hazard rather than a demonstration, and
 * the safeguard should survive being taken out of context.
 *
 * The wording of the monthly test is the real one, taken from what Code Maroon actually publishes.
 */
export const CODE_MAROON_SAMPLES: Record<string, CodeMaroonAlert> = {
  tornado: {
    title: 'SAMPLE - Tornado Warning for the College Station campus. Take shelter now.',
    description:
      'SAMPLE ALERT, NOT A REAL EMERGENCY. A tornado warning has been issued. Move to the lowest floor, ' +
      'away from windows, and remain there until an all clear is given.',
    link: 'https://emergency.tamu.edu/',
    published: new Date(),
    guid: 'sample-tornado',
    extra: {}
  },
  'gas-leak': {
    title: 'SAMPLE - Gas leak reported near Zachry Engineering Complex. Avoid the area.',
    description:
      'SAMPLE ALERT, NOT A REAL EMERGENCY. A natural gas odor has been reported. Avoid the area and ' +
      'follow directions from emergency personnel.',
    link: 'https://emergency.tamu.edu/',
    published: new Date(),
    guid: 'sample-gas-leak',
    extra: {}
  },
  'active-threat': {
    title: 'SAMPLE - Active threat reported on campus. Run, Hide, Fight.',
    description:
      'SAMPLE ALERT, NOT A REAL EMERGENCY. Avoid the area, secure your location, and wait for further ' +
      'instruction.',
    link: 'https://emergency.tamu.edu/',
    published: new Date(),
    guid: 'sample-active-threat',
    extra: {}
  },
  test: {
    // The real monthly test wording, as published. Kept exact so the demonstration shows what the
    // map does with the message it will actually see most often.
    title: 'This is the monthly test of the emergency notification system - No Action Required',
    description: 'This is the monthly test of the emergency notification system - No Action Required',
    link: 'https://emergency.tamu.edu/',
    published: new Date(),
    guid: 'sample-monthly-test',
    extra: {}
  }
};

export const CODE_MAROON_SAMPLE_KEYS = Object.keys(CODE_MAROON_SAMPLES);
