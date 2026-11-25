import { emailHtml } from './email-markdown';
import type { GisdaySite } from './sites';

/**
 * What an email carries besides its text, for the Texas A&M GIS Day design (#3114): the label above its title, the
 * season's days, the session it is about, if any, and why the person is getting it.
 */
export interface EmailDesign {
  /** The small label above the title, such as "YOUR SESSION". */
  label: string;
  /** The season's days, each as a date (`2026-11-16` or a full ISO string): the dates line and the day strip. */
  days: Array<string>;
  /** The session the email is about, for the details box, or none. */
  session?: EmailSessionDetails | null;
  /** Why the person is getting it, for the footer. */
  why: string;
}

/** A session in the details box: its name, when and where, and its online link when it has one. */
export interface EmailSessionDetails {
  name: string;
  when: string;
  where: string;
  online?: string | null;
}

/** A season's days, as the API loads them (`season.days`), for a design: each day's date as an ISO string. */
export function seasonDaysOf(season: { days?: Array<{ date: Date | string }> | null } | null | undefined): Array<string> {
  return (season?.days ?? []).filter((d) => d?.date).map((d) => new Date(d.date).toISOString());
}

/** Why a speaker gets the profile and session emails, in the design's footer. */
function presenting(siteName: string): string {
  return `You are getting this email because you are presenting at ${siteName}.`;
}

/** The profile email's design (#3114): no session. */
export function profileEmailDesign(siteName: string, days: Array<string>): EmailDesign {
  return { label: 'Your presenter profile', days, session: null, why: presenting(siteName) };
}

/** The session details email's design (#3114): the session in its details box. */
export function sessionEmailDesign(siteName: string, days: Array<string>, session: EmailSessionDetails): EmailDesign {
  return { label: 'Your session', days, session, why: presenting(siteName) };
}

/**
 * The Ask to judge email's design (#3183): the session in its details box, under a label for a judge rather than a
 * presenter, and why they are getting it.
 */
export function judgingEmailDesign(siteName: string, days: Array<string>, session: EmailSessionDetails): EmailDesign {
  return {
    label: 'Your judging',
    days,
    session,
    why: `You are getting this email because you are judging at ${siteName}.`
  };
}

/** The competition's review, finalist and reminder emails' design (#3114). */
export function reviewEmailDesign(siteName: string, days: Array<string>): EmailDesign {
  return {
    label: 'Your submission',
    days,
    session: null,
    why: `You are getting this email about your submission to the ${siteName} competition.`
  };
}

/** Whether a site's emails carry the Texas A&M GIS Day design: only Texas A&M's site, decided on #3114 (2A). */
export function hasEmailDesign(site: Pick<GisdaySite, 'brand'>): boolean {
  return site.brand === 'tamu';
}

/**
 * An email's HTML, the one place every site email's is made (#3114). Its text, as Markdown, becomes HTML (`emailHtml`,
 * #3044). On Texas A&M's site that HTML is the body of the department's GIS Day email design, with the season's dates and
 * days, the session's details and the sender's name and address filled in; elsewhere it is sent as it is. The plain
 * text goes beside it either way. The composer's preview draws it with the same function, so it shows what arrives.
 *
 * @param from The From header, as "Name <address>", for the sign-off: the sender the admin chose (#3100), or the site.
 */
export function siteEmailHtml(
  text: string,
  email: { site: Pick<GisdaySite, 'brand' | 'name'>; subject: string; from?: string | null; design?: EmailDesign | null }
): string {
  const body = emailHtml(text);

  if (!email.design || !hasEmailDesign(email.site)) {
    return body;
  }

  return designed(body, email.subject, email.design, senderOf(email.from));
}

/** The name and address of a From header, "Name <address>" or the address alone. */
export function senderOf(from: string | null | undefined): { name: string | null; address: string | null } {
  const match = from?.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);

  if (match) {
    return { name: match[1].trim() || null, address: match[2].trim() };
  }

  return { name: null, address: from?.trim() || null };
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** A season's day as its calendar date: the date it is stored as, whatever the time zone. */
function dayOf(day: string): Date {
  const [y, m, d] = day.slice(0, 10).split('-').map(Number);

  return new Date(Date.UTC(y, m - 1, d));
}

/** The season's days, in order, each once. */
function seasonDays(days: Array<string>): Array<Date> {
  return [...new Set(days.filter(Boolean).map((d) => d.slice(0, 10)))].sort().map(dayOf);
}

/** The season's dates as the title block says them: "November 16–20, 2026", or across months, or one day. Empty with none. */
export function seasonDatesLine(days: Array<string>): string {
  const all = seasonDays(days);

  if (all.length === 0) {
    return '';
  }

  const [first, last] = [all[0], all[all.length - 1]];
  const date = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;

  if (first.getTime() === last.getTime()) {
    return `${date(first)}, ${first.getUTCFullYear()}`;
  }

  if (first.getUTCFullYear() !== last.getUTCFullYear()) {
    return `${date(first)}, ${first.getUTCFullYear()} – ${date(last)}, ${last.getUTCFullYear()}`;
  }

  const end = first.getUTCMonth() === last.getUTCMonth() ? `${last.getUTCDate()}` : date(last);

  return `${date(first)}–${end}, ${last.getUTCFullYear()}`;
}

/** The day strip: each of the season's days, its weekday over its date ("MON" over "Nov 16"). */
export function seasonDayStrip(days: Array<string>): Array<{ weekday: string; date: string }> {
  return seasonDays(days).map((d) => ({
    weekday: WEEKDAYS[d.getUTCDay()],
    date: `${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`
  }));
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escape = (text: string) => (text ?? '').replace(/[&<>"]/g, (c) => ESCAPES[c]);

/**
 * The maintainer's Texas A&M GIS Day email shell (TAMU_GIS_Day_Email_Shell_Template.html, 15 November 2026), with every
 * style inline, as its own notes ask, so it looks the same in Outlook, Gmail and phone mail apps. Its blocks are kept in
 * its order; the highlight cards, the button and the unsubscribe line are left out, since these are one-to-one emails
 * about a person's own profile, session or submission (#3114, 3A). Colours: maroon #500000, title block #2b2b2b, tan
 * #e8d9c0, card #f4f1ea, body text #3c3c3c, grey #707070, page #d6d6d6.
 */
function designed(
  body: string,
  subject: string,
  design: EmailDesign,
  sender: { name: string | null; address: string | null }
): string {
  const font = 'font-family:Arial,Helvetica,sans-serif;';
  const dates = seasonDatesLine(design.days);
  const strip = seasonDayStrip(design.days);
  const width = strip.length ? `${Math.floor(100 / strip.length)}%` : '100%';
  const session = design.session;

  return [
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(subject)}</title></head><body style="margin:0;padding:0;background:#d6d6d6;">`,
    `<div style="display:none;max-height:0;overflow:hidden;">${escape(subject)}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#d6d6d6"><tr><td align="center" style="padding:24px 8px;">`,
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;">`,
    // Top bar.
    `<tr><td bgcolor="#500000" style="${font}padding:20px 32px;color:#ffffff;font-size:13px;letter-spacing:1px;">TEXAS A&amp;M UNIVERSITY&nbsp;&nbsp;|&nbsp;&nbsp;DEPARTMENT OF GEOGRAPHY</td></tr>`,
    // Title block: the dates from the season.
    `<tr><td bgcolor="#2b2b2b" align="center" style="${font}padding:40px 24px 30px;color:#ffffff;">`,
    `<div style="font-size:14px;letter-spacing:4px;color:#e8d9c0;">${escape(design.label.toUpperCase())}</div>`,
    `<div style="font-size:52px;line-height:56px;font-weight:bold;margin:10px 0 4px;">GIS DAY(S)</div>`,
    dates ? `<div style="font-size:22px;line-height:28px;">${escape(dates)}</div>` : '',
    `<div style="font-size:14px;color:#cccccc;padding-top:6px;">Texas A&amp;M University &#183; College Station &#183; Free</div>`,
    `</td></tr>`,
    // Day strip: the season's days.
    strip.length
      ? `<tr><td bgcolor="#500000"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${strip
          .map(
            (d) =>
              `<td align="center" width="${width}" style="${font}padding:10px 2px;"><div style="font-size:16px;font-weight:bold;color:#ffffff;">${d.weekday}</div><div style="font-size:11px;color:#e8d9c0;line-height:14px;">${d.date}</div></td>`
          )
          .join('')}</tr></table></td></tr>`
      : '',
    // The email's own text, as HTML.
    `<tr><td style="${font}padding:28px 32px 16px;color:#3c3c3c;font-size:15px;line-height:24px;">${body}</td></tr>`,
    // Details box: the session, when the email is about one.
    session
      ? `<tr><td style="padding:0 32px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f1ea" style="border-left:4px solid #500000;"><tr><td style="${font}padding:14px 16px;color:#3c3c3c;font-size:14px;line-height:22px;">` +
        `<div style="font-size:17px;font-weight:bold;color:#500000;padding-bottom:4px;line-height:21px;">${escape(session.name)}</div>` +
        `<b>When:</b> ${escape(session.when)}<br><b>Where:</b> ${escape(session.where)}` +
        (session.online
          ? `<br><b>Online:</b> <a href="${escape(session.online)}" style="color:#500000;">${escape(session.online)}</a>`
          : '') +
        `</td></tr></table></td></tr>`
      : '',
    // Divider.
    `<tr><td style="padding:4px 32px 20px;"><div style="border-top:1px solid #dcd6c8;font-size:0;line-height:0;">&nbsp;</div></td></tr>`,
    // Sign-off: who it is from, as chosen in "Send as" (#3100). The text ends with its own closing line.
    sender.name || sender.address
      ? `<tr><td style="${font}padding:8px 32px 28px;color:#3c3c3c;font-size:15px;line-height:24px;">${escape(sender.name ?? '')}<br>` +
        `<span style="font-size:13px;line-height:20px;color:#707070;">Department of Geography, Texas A&amp;M University` +
        (sender.address
          ? `<br><a href="mailto:${escape(sender.address)}" style="color:#500000;">${escape(sender.address)}</a>`
          : '') +
        `</span></td></tr>`
      : '',
    // Footer, with why they are getting it, and no unsubscribe line.
    `<tr><td bgcolor="#3c3c3c" align="center" style="${font}padding:20px 24px;color:#dddddd;font-size:12px;line-height:19px;">Texas A&amp;M University&nbsp;&nbsp;|&nbsp;&nbsp;Department of Geography&nbsp;&nbsp;|&nbsp;&nbsp;College Station, TX 77843-3147<br>${escape(design.why)}</td></tr>`,
    `</table></td></tr></table>`,
    `</body></html>`
  ]
    .filter(Boolean)
    .join('\n');
}
