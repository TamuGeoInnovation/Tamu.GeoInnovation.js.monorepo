/**
 * A competition participant's email box read as addresses (#3043), the way `add-competition-speakers.ps1`
 * (kubernetes-config, `6. GIS Day/data`) read it when it made the finalists' speaker records: several addresses typed
 * into one box are split on commas, semicolons and spaces, a bare NetID is its tamu.edu address, and each comes once,
 * lower-cased, in the order typed. Anything that matches participants to speakers reads them this way, so a co-author
 * who is on the program is found.
 */
export function participantEmails(value: unknown): Array<string> {
  if (typeof value !== 'string') {
    return [];
  }

  const emails: Array<string> = [];

  for (const part of value.split(/[\s,;]+/)) {
    let email = part.trim().toLowerCase();

    // A bare NetID typed for an email is that NetID at tamu.edu.
    if (email && !email.includes('@') && /^[a-z][a-z0-9._-]{1,40}$/.test(email)) {
      email = `${email}@tamu.edu`;
    }

    if (email && !emails.includes(email)) {
      emails.push(email);
    }
  }

  return emails;
}
