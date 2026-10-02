/**
 * The emergency types the university itself publishes, at https://emergency.tamu.edu/, each with the
 * procedure page it links to.
 *
 * Taken from their site rather than invented here. When an alert is on screen, the most useful thing
 * the map can offer beyond "where" is "what to do", and that answer should be the university's own
 * wording, not ours.
 *
 * The feed carries no type field that we know of - no real alert item has been observed - so the type
 * is inferred from the alert text. Inference is a guess, and the interface says so rather than
 * presenting it as fact.
 */
export interface EmergencyType {
  id: string;
  label: string;
  /** Lower-cased words that suggest this type. Ordered by how strongly they imply it. */
  hints: string[];
  /** The university's procedure page for this type. */
  procedure: string;
}

const EM = 'https://em.tamu.edu/emergency-procedures';

export const EMERGENCY_TYPES: EmergencyType[] = [
  { id: 'active-threat', label: 'Active Threat', hints: ['active threat', 'active shooter', 'armed', 'shooter', 'gunman'], procedure: `${EM}/personal-safety.html` },
  { id: 'bomb-threat', label: 'Bomb Threat', hints: ['bomb', 'explosive', 'explosion', 'suspicious package'], procedure: `${EM}/personal-safety.html#bomb-threat` },
  { id: 'concerning-behavior', label: 'Concerning Behavior', hints: ['concerning behavior', 'suspicious person'], procedure: `${EM}/personal-safety.html#concerning-behavior` },
  { id: 'tornado', label: 'Tornado', hints: ['tornado', 'funnel cloud'], procedure: `${EM}/severe-weather.html#tornado` },
  { id: 'severe-thunderstorm', label: 'Severe Thunderstorms', hints: ['severe thunderstorm', 'thunderstorm', 'lightning', 'hail', 'flash flood', 'flooding'], procedure: `${EM}/severe-weather.html` },
  { id: 'winter-weather', label: 'Winter Weather', hints: ['winter weather', 'ice storm', 'freezing', 'snow'], procedure: `${EM}/severe-weather.html#winter-weather` },
  { id: 'extreme-heat', label: 'Extreme Heat', hints: ['extreme heat', 'heat advisory', 'heat index'], procedure: `${EM}/severe-weather.html#extreme-heat` },
  { id: 'gas-leak', label: 'Gas Leak', hints: ['gas leak', 'natural gas', 'gas odor'], procedure: `${EM}/fire-hazmat.html#gas-leak` },
  { id: 'hazmat', label: 'Hazardous Materials Release', hints: ['hazardous material', 'hazmat', 'chemical release', 'chemical spill'], procedure: `${EM}/fire-hazmat.html#hazardous-materials-release` },
  { id: 'fire', label: 'Chemical Fire', hints: ['fire', 'smoke', 'evacuate building'], procedure: `${EM}/fire-hazmat.html` },
  { id: 'poison', label: 'Poison', hints: ['poison', 'contaminated water', 'do not drink'], procedure: `${EM}/personal-preparedness.html#poison` }
];

/** The university's index of emergency procedures, for an alert whose type we cannot infer. */
export const EMERGENCY_PROCEDURES_INDEX = 'https://emergency.tamu.edu/';

/**
 * Infers the emergency type from the alert text.
 *
 * Returns the first type whose hints appear, checking the title before the description because the
 * headline is where the nature of an alert is stated. Returns `undefined` rather than guessing when
 * nothing matches - "we do not know" is a usable answer here, and a wrong procedure link is not.
 *
 * The monthly test ("This is the monthly test of the emergency notification system - No Action
 * Required") matches nothing, which is correct: a test is not an emergency type.
 */
export function inferEmergencyType(title: string, description = ''): EmergencyType | undefined {
  const headline = (title || '').toLowerCase();
  const body = (description || '').toLowerCase();

  return (
    EMERGENCY_TYPES.find((type) => type.hints.some((hint) => headline.includes(hint))) ??
    EMERGENCY_TYPES.find((type) => type.hints.some((hint) => body.includes(hint)))
  );
}

/** True when the alert is the system's routine monthly test rather than a real emergency. */
export function isMonthlyTest(title: string, description = ''): boolean {
  const text = `${title} ${description}`.toLowerCase();

  return text.includes('monthly test') || text.includes('test of the emergency notification system');
}
