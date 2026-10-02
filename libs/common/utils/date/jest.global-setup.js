/**
 * Runs the date tests in College Station's time zone (#1298).
 *
 * Set here, before the test workers start, so they inherit it; setting it inside a test is too late.
 * The bug this guards against only exists in a time zone behind UTC, and CI runs in UTC.
 */
module.exports = async () => {
  process.env.TZ = 'America/Chicago';
};
