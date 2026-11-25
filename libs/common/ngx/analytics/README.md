# common-ngx-analytics

The analytics helpers every Angular app here shares.

`trackEvent(analytics, action, category, custom)` sends one Angulartics2 event whose `gstCustom` is stamped as the
reports expect: `guid` (a new random id), then `date` (`Date.now()`), then the event's own fields in the order given
(#3488). Use it rather than building `{ guid: crypto.randomUUID(), date: Date.now(), ... }` by hand.

Run `nx test common-ngx-analytics` to execute the unit tests.
