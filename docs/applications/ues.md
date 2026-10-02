# The UES applications

Four map applications in this repository were built for **Utilities & Energy Services**. They are not
deployed by our pipeline and do not appear on `aggiemap.tamu.edu`, which made them look dead from
inside this repository. At least one of them is not.

Recorded on 2 October 2026, from a mail thread with UES. Written down because the only evidence was
in one person's inbox, and the deletion plan in
[#1201](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1201) and
[#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226) was about to
act on the opposite assumption.

## In daily use

| | |
| --- | --- |
| **Application** | `apps/ues-operations-angular` — "UES Operations \| Texas A&M University" |
| **Live at** | <https://maps.apogee.tamu.edu/operations/map/d> |
| **Access** | Behind the Apogee login. Not reachable without being in the Apogee group |
| **Who uses it** | "Everyone in UES uses the UES Operations map almost daily" — Darryus Vaughn, Manager Planning & Design, GIS / Line Strike Avoidance, 2 October 2026 |
| **What it shows** | The non-public subsurface layers — hot and cold water and similar — for field crews |

**It is deployed by UES, not by us.** Nothing in our Azure pipeline builds or releases it, which is
why this repository has no record of it running anywhere. Their GIS servers are managed by
**Jianhua Zhou (JZ)**, `jianhuazhou@tamu.edu`.

**They have asked that updates go to their test operations map first**, before production. We do not
currently know where that test site is, or whether we can deploy to it — that is an open question with
JZ.

## Not yet confirmed either way

The other three were never asked about specifically. UES answered about "the UES Operations map", so
treat the rest as **unknown**, not unused.

| Application | Title it ships | Backing API |
| --- | --- | --- |
| `apps/ues-effluent-angular` | UES Effluent Map | `apps/ues-effluent-data-api-nest` |
| `apps/ues-recycling-angular` | UES Recycling Trends | `apps/ues-recycling-data-api-nest` |
| `apps/ues-valves-angular` | Domestic Cold Water \| UES | `apps/ues-valves-nest` |

Supporting libraries: `libs/ues/operations`, `libs/ues/effluent`, `libs/ues/recycling`,
`libs/ues/cold-water`, `libs/ues/common`, `libs/ues/assets`, `libs/ues/sass`.

`ues-valves-angular` is the Domestic Cold Water map and is backed by `libs/ues/cold-water`; the names
do not match, which is worth knowing before searching for either.

## None of them have had feature work in over a year

Every recent commit touching these applications is a workspace-wide sweep — a dependency upgrade, a
layer-service migration, a spec cleanup — not a change to the application itself. The last
UES-specific work predates the window the current history covers.

That matches what UES said: the Operations map "is behind", and they are open to updates.

## Why this matters to the modernization plan

[#1201](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1201) proposes
deleting 28 applications that ship nowhere, and
[#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226) records them
first. **"Ships nowhere from our pipeline" is not the same as "nobody uses it."** The UES Operations
map is the counter-example: live, behind a login we cannot see, deployed by someone else, and used
every day.

Before any UES application is deleted, ask UES. Two of them — `ues-recycling-angular` and
`ues-valves-angular` — are also on the list of projects that already fail to build on `development`,
so a deletion could easily be mistaken for a cleanup of something broken and unwanted.

## Open questions

1. Are the Effluent, Recycling and Cold Water maps used? **Dan is asking UES.**
2. Where is the test operations map, and can we deploy to it? **With JZ.**
3. Can we get Apogee access, so the Operations map can be tested rather than assumed?
4. Should the Operations map join the smoke suite? It is behind a login, so it cannot be checked the
   way the public maps are.
