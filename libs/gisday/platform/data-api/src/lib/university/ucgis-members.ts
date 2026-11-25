/**
 * The UCGIS member institutions, so a visitor from any of them finds their school in the complete-profile page's
 * institution list instead of choosing Other (#2721).
 *
 * Taken from UCGIS's public members page, https://www.ucgis.org/site/members, on 8 November 2026: the Full Institutional,
 * Basic, Multi-Campus Systems and International Affiliate members. Basic members are listed there by department; the
 * institution is what is kept here. The two Government and Commercial Affiliates (Esri and the US Geological Survey) are
 * not institutions a student attends or a faculty member works at, so they are not in this list.
 *
 * `alsoKnownAs` holds other spellings of the same institution, including the ones already in a GIS Day database, so an
 * institution that is there under another name is not added a second time. Spelling differences that `institutionKey`
 * already ignores (case, "The", punctuation, "&" spacing) need no entry.
 */
export interface MemberInstitution {
  name: string;
  alsoKnownAs?: Array<string>;
}

export const UCGIS_MEMBER_INSTITUTIONS: ReadonlyArray<MemberInstitution> = [
  // Members, Full Institutional Level
  { name: 'American University' },
  { name: 'Arizona State University' },
  { name: 'Cornell University' },
  { name: 'Dartmouth College' },
  { name: 'Georgia Institute of Technology', alsoKnownAs: ['Georgia Tech'] },
  { name: 'Hunter College, City University of New York', alsoKnownAs: ['Hunter College', 'CUNY Hunter College'] },
  { name: 'James Madison University' },
  { name: 'Johns Hopkins University' },
  { name: 'Kansas State University' },
  { name: 'Louisiana State University' },
  { name: 'North Carolina State University', alsoKnownAs: ['NC State University'] },
  { name: 'Northeastern University' },
  { name: 'The Ohio State University' },
  { name: 'Oregon State University' },
  { name: 'Penn State University', alsoKnownAs: ['Pennsylvania State University'] },
  { name: 'Rutgers University' },
  { name: 'San Diego State University' },
  {
    name: 'University at Buffalo, State University of New York',
    alsoKnownAs: ['University at Buffalo', 'SUNY Buffalo']
  },
  { name: 'Syracuse University' },
  { name: 'Temple University' },
  { name: 'Texas A&M University', alsoKnownAs: ['Texas A&M University, College Station'] },
  { name: 'Texas A&M University-Corpus Christi' },
  { name: 'Texas State University', alsoKnownAs: ['Texas State University, San Marcos'] },
  { name: 'University of California, Santa Barbara', alsoKnownAs: ['University of California at Santa Barbara', 'UC Santa Barbara'] },
  { name: 'University of Colorado Boulder', alsoKnownAs: ['University of Colorado'] },
  { name: 'University of Connecticut' },
  { name: 'University of Illinois Urbana-Champaign', alsoKnownAs: ['University of Illinois at Urbana-Champaign'] },
  { name: 'University of Iowa' },
  { name: 'University of Maine' },
  { name: 'University of Maryland', alsoKnownAs: ['University of Maryland, College Park'] },
  { name: 'University of Nebraska-Lincoln' },
  { name: 'University of Pennsylvania' },
  { name: 'University of Pittsburgh' },
  { name: 'University of Redlands' },
  { name: 'University of Southern California' },
  { name: 'University of Washington' },
  { name: 'University of Wisconsin-Madison' },
  { name: 'University of Wyoming' },
  { name: 'Washington University in St. Louis' },
  { name: 'Yale University' },

  // Members, Basic Level
  { name: 'Auburn University' },
  { name: 'Brown University' },
  { name: 'Claremont Graduate University' },
  { name: 'Clemson University', alsoKnownAs: ['Clemson'] },
  { name: 'George Mason University' },
  { name: 'Harvard University' },
  { name: 'Kent State University' },
  { name: 'Massachusetts Institute of Technology', alsoKnownAs: ['MIT'] },
  { name: 'Portland State University' },
  { name: 'University of Alabama' },
  { name: 'University at Albany, State University of New York', alsoKnownAs: ['University at Albany', 'SUNY Albany'] },
  { name: 'University of Chicago' },
  { name: 'University of Denver' },
  { name: 'University of Georgia' },
  { name: 'University of Kansas' },
  { name: 'University of Massachusetts Amherst' },
  { name: 'University of Miami' },
  { name: 'University of North Carolina at Charlotte', alsoKnownAs: ['UNC Charlotte'] },
  { name: 'University of Oklahoma' },
  { name: 'University of Tennessee, Knoxville', alsoKnownAs: ['University of Tennessee'] },
  { name: 'University of Texas at Dallas', alsoKnownAs: ['UT Dallas'] },
  { name: 'Virginia Tech', alsoKnownAs: ['Virginia Polytechnic Institute and State University'] },
  { name: 'Western Michigan University' },

  // Members, Multi-Campus Systems
  { name: 'California State University' },
  { name: 'University of Minnesota', alsoKnownAs: ['University of Minnesota System', 'University of Minnesota Twin Cities'] },

  // International Affiliate Members
  { name: 'University of Salzburg', alsoKnownAs: ['Paris Lodron University of Salzburg'] },
  { name: 'KU Leuven' }
];

/**
 * What two spellings of one institution have in common: lower case, without a leading "The", with "&" closed up
 * ("A & M" is "A&M") and with commas, hyphens, full stops and repeated spaces made single spaces. So "The Ohio State
 * University" is "Ohio State University" and "Texas A&M University-Corpus Christi" is "Texas A&M University Corpus
 * Christi". Anything further apart is listed in `alsoKnownAs`.
 */
export function institutionKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*&\s*/g, '&')
    .replace(/[,.\-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^the /, '');
}

/**
 * The members that are not among `existingNames` under their name or any of their other spellings, in the list's order.
 */
export function institutionsToAdd(
  existingNames: ReadonlyArray<string | null | undefined>,
  members: ReadonlyArray<MemberInstitution> = UCGIS_MEMBER_INSTITUTIONS
): Array<MemberInstitution> {
  const existing = new Set(existingNames.filter((n): n is string => !!n).map(institutionKey));

  return members.filter((m) => ![m.name, ...(m.alsoKnownAs ?? [])].some((n) => existing.has(institutionKey(n))));
}

export interface MemberPlan {
  /** Members to add, in the list's order. */
  add: Array<string>;
  /** Members already there, with the spelling they are there under. */
  keep: Array<{ name: string; as: string }>;
}

/**
 * What adding the members to a season with `existingNames` would do: which to add, and which are already there and under
 * what spelling. The production script in the operations repository asks for this (#2730), so the list and its matching
 * rules exist only here.
 */
export function planMembers(
  existingNames: ReadonlyArray<string | null | undefined>,
  members: ReadonlyArray<MemberInstitution> = UCGIS_MEMBER_INSTITUTIONS
): MemberPlan {
  const names = existingNames.filter((n): n is string => !!n);
  const adding = institutionsToAdd(names, members);

  return {
    add: adding.map((m) => m.name),
    keep: members
      .filter((m) => !adding.includes(m))
      .map((m) => ({
        name: m.name,
        as: names.find((n) => [m.name, ...(m.alsoKnownAs ?? [])].some((k) => institutionKey(k) === institutionKey(n))) ?? m.name
      }))
  };
}
