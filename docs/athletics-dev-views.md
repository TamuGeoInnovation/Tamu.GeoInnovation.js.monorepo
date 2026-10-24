# What the development athletics views carry, against production's

A measurement, not a rule. Taken 23 October 2026 by reading every layer of all eleven athletics
views from both servers' REST (`<service>/layers?f=json`) and comparing the fields against the SQL
expression each map filters that layer with.

- **Development:** `gis.dev.tamu.edu`
- **Production:** `arc.ts.tamu.edu`, except men's basketball, which is `gis.tamu.edu`
- **The maps:** `libs/ts/events/ngx/src/lib/definitions/*-parking.definitions.ts`, reached on dev
  through `developmentSources` (see [`map-layers.md`](map-layers.md))

[#2143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2143) pointed the
eleven athletics maps at the republished development views. On dev, **8 of the 11 list a layer that
draws nothing**, because those views carry a different schema from the production services the
definitions were written against. Production is healthy: all 8 athletics routes pass
`map-layers.spec.ts` there.

**So these views must not be published to production as they are** - production's definitions would
then fail the same way. What to do about it is
[#2209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2209).

The maps filter each layer with a SQL expression. Where the view does not carry the column that
expression names, the layer appears in the map's legend and draws nothing - no error, just an empty
layer.

## 0. The two patterns

Every failure is one of two shapes.

**a. The Accessible Parking Spaces layer lost `event` and `type`.** Production's accessible layer carries exactly
four fields - `objectid`, `id`, `type`, `event` - and the maps filter it on `event` and `type` to show one sport's
accessible spaces. Dev's accessible layer carries 34 fields, none of them `event` or `type`: it is a marker-feed
schema (`mrkid`, `feed`, `popup`, `schedule`, `start_date` ...). Affects indoor track, outdoor track, soccer,
softball, swimming, volleyball and women's basketball.

**b. The Event Parking Lots layer lost the per-sport columns.** Production's lots layer carries 53 fields including
one per sport (`baseball`, `softball`, `soccer`, `trackxc`, `wbasketball`, `lottype` and 43 more). Dev's carries 39,
with none of them. Affects baseball, cross country and women's basketball, which filter the lots by sport; the other
maps' lots draw because they do not filter.

The 49 columns on production's lots layer that dev's does not have:

`aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`,
`fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`,
`lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name_1`, `nsc`, `nscn`,
`objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`,
`spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`,
`volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`

Tennis and both basketballs draw correctly on dev today.

## 1. The columns the maps need, layer by layer

| Map | Dev layer | What the map filters on | Column | On production | On dev |
| --- | --- | --- | --- | --- | --- |
| baseball | `/0` Baseball Symbols | `event = 'Baseball' AND type <> 'Accessible Shuttle Stop'` | `event` | yes | **MISSING** |
| baseball | `/0` Baseball Symbols | `event = 'Baseball' AND type <> 'Accessible Shuttle Stop'` | `type` | yes | **MISSING** |
| baseball | `/2` Gate/Road Closure | `baseball = 1` | `baseball` | yes | **MISSING** |
| baseball | `/3` Event Parking Lots | `baseball IN ('AnyValid','SeasonPass')` | `baseball` | yes | **MISSING** |
| baseball | `/3` Accessible Parking Lots | `baseball = 'Permit'` | `baseball` | yes | **MISSING** |
| cross country | `/1` Event Parking Lots | `trackxc = 'EventParking'` | `trackxc` | yes | **MISSING** |
| indoor track | `/0` Accessible Parking Spaces | `event = 'TrackIndoor' AND type IN ('Accessible','Disabled')` | `event` | yes | **MISSING** |
| indoor track | `/0` Accessible Parking Spaces | `event = 'TrackIndoor' AND type IN ('Accessible','Disabled')` | `type` | yes | **MISSING** |
| outdoor track | `/0` Accessible Parking Spaces | `event = 'TrackOutdoor'` | `event` | yes | **MISSING** |
| soccer | `/0` Accessible Parking Spaces | `event = 'Soccer'` | `event` | yes | **MISSING** |
| softball | `/0` Accessible Parking Spaces | `event = 'Softball'` | `event` | yes | **MISSING** |
| swimming | `/0` Accessible Parking Spaces | `event = 'Swimming'` | `event` | yes | **MISSING** |
| volleyball | `/0` Accessible Parking Spaces | `event = 'Volleyball'` | `event` | yes | **MISSING** |
| womens basketball | `/0` Accessible Parking Spaces | `event = 'Basketball' AND type IN ('Accessible','Disabled')` | `event` | yes | **MISSING** |
| womens basketball | `/0` Accessible Parking Spaces | `event = 'Basketball' AND type IN ('Accessible','Disabled')` | `type` | yes | **MISSING** |
| womens basketball | `/1` Event Parking Lots | `wbasketball IS NOT NULL` | `wbasketball` | yes | **MISSING** |

**16 column(s) missing on dev**, across 9 maps.

### What to add, as a list

- **BaseballParking_view `/0`** (Baseball Symbols, baseball): add `event`, `type`
- **BaseballParking_view `/2`** (Gate/Road Closure, baseball): add `baseball`
- **BaseballParking_view `/3`** (Event Parking Lots, baseball): add `baseball`
- **BaseballParking_view `/3`** (Accessible Parking Lots, baseball): add `baseball`
- **CrossCountryParking_view `/1`** (Event Parking Lots, cross country): add `trackxc`
- **IndoorTrackParking_view `/0`** (Accessible Parking Spaces, indoor track): add `event`, `type`
- **OutdoorTrackParking_view `/0`** (Accessible Parking Spaces, outdoor track): add `event`
- **SoccerParking_view `/0`** (Accessible Parking Spaces, soccer): add `event`
- **SoftballParking_view `/0`** (Accessible Parking Spaces, softball): add `event`
- **SwimmingParking_view `/0`** (Accessible Parking Spaces, swimming): add `event`
- **VolleyballParking_view `/0`** (Accessible Parking Spaces, volleyball): add `event`
- **WomensBasketballParking_view `/0`** (Accessible Parking Spaces, womens basketball): add `event`, `type`
- **WomensBasketballParking_view `/1`** (Event Parking Lots, womens basketball): add `wbasketball`

## 2. Layer order and names


**baseball** - production `BaseballParking_view`, dev `BaseballParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Baseball Symbols | Baseball Symbols |
| 1 | Accessible Shuttle Route | Accessible Shuttle Route |
| 2 | Gate/Road Closure | Closures **differs** |
| 3 | Baseball Event Parking Lots | Baseball Event Parking Lots |

**cross country** - production `CrossCountryParking_view`, dev `CrossCountryParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Cross Country Area | Cross Country Area |
| 1 | Cross Country Event Parking Lots | Cross Country Event Parking Lots |

**indoor track** - production `IndoorTrackParking_view`, dev `IndoorTrackParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Purchase hourly visitor parking | Accessible Parking Spaces **differs** |
| 1 | Accessible Parking Space | Indoor Track Building **differs** |
| 2 | Indoor Track Event Parking Lots | Indoor Track Event Parking Lots |
| 3 | Indoor Track Building | - **differs** |
| 4 | Safety First! | - **differs** |
| 5 | Team Bus Parking | - **differs** |

**mens basketball** - production `MBskt_view`, dev `MensBasketballParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Basketball Icons | Basketball Icons |
| 1 | Basketball Closures | Basketball Closures |
| 2 | Basketball Parking | Basketball Parking |

**outdoor track** - production `OutdoorTrackParking_view`, dev `OutdoorTrackParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Purchase hourly visitor parking | Accessible Parking Spaces **differs** |
| 1 | Accessible Parking Space | Outdoor Track Event Parking Lots **differs** |
| 2 | Outdoor Track Event Parking Lots | - **differs** |
| 3 | Safety First! | - **differs** |

**soccer** - production `SoccerParking_view`, dev `SoccerParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Purchase hourly visitor parking | Accessible Parking Spaces **differs** |
| 1 | Accessible Parking Space | Soccer Event Parking Lots **differs** |
| 2 | Soccer Event Parking Lots | - **differs** |
| 3 | Safety First! | - **differs** |

**softball** - production `SoftballParking_view`, dev `SoftballParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Purchase hourly visitor parking | Accessible Parking Spaces **differs** |
| 1 | Accessible Parking Space | Softball Event Parking Lots **differs** |
| 2 | Softball Event Parking Lots | - **differs** |
| 3 | Safety First! | - **differs** |

**swimming** - production `SwimmingParking_view`, dev `SwimmingParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Purchase hourly visitor parking | Accessible Parking Spaces **differs** |
| 1 | Accessible Parking Space | Swimming Event Parking Lots **differs** |
| 2 | Swimming Event Parking Lots | - **differs** |
| 3 | Safety First! | - **differs** |

**tennis** - production `TennisParking_view`, dev `TennisParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Tennis Symbols | Tennis Event Parking Lots **differs** |
| 1 | Tennis Event Parking Lots | - **differs** |

**volleyball** - production `VolleyballParking_view`, dev `VolleyballParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Purchase hourly visitor parking | Accessible Parking Spaces **differs** |
| 1 | Accessible Parking Space | Volleyball Event Parking Lots **differs** |
| 2 | Volleyball Event Parking Lots | - **differs** |
| 3 | Safety First! | - **differs** |

**womens basketball** - production `WomensBasketballParking_view`, dev `WomensBasketballParking_view`

| Index | Production layer | Dev layer |
| --- | --- | --- |
| 0 | Purchase hourly visitor parking | Accessible Parking Spaces **differs** |
| 1 | Accessible Parking Space | Women's Basketball Event Parking Lots **differs** |
| 2 | Women's Basketball Event Parking Lots | - **differs** |
| 3 | Safety First! | - **differs** |

## 3. Every field, per layer


### baseball


**`/0`** - production: Baseball Symbols | dev: Baseball Symbols

- production only (3): `event`, `id`, `type`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Shuttle Route | dev: Accessible Shuttle Route

- production only (0): none
- dev only (0): none
- both (35): `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `objectid`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`

**`/2`** - production: Gate/Road Closure | dev: Closures

- production only (7): `baseball`, `basketball`, `crosscount`, `feb23`, `objectid_1`, `shape_leng`, `variable_m`
- dev only (36): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `event`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `type`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `SHAPE__Area`, `SHAPE__Length`, `objectid`

**`/3`** - production: Baseball Event Parking Lots | dev: Baseball Event Parking Lots

- production only (49): `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name_1`, `nsc`, `nscn`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (35): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `event`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `type`, `updatedat`, `visible`, `weight`, `zoom`
- both (4): `SHAPE__Area`, `SHAPE__Length`, `name`, `objectid`

### cross country


**`/0`** - production: Cross Country Area | dev: Cross Country Area

- production only (0): none
- dev only (0): none
- both (35): `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `objectid`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`

**`/1`** - production: Cross Country Event Parking Lots | dev: Cross Country Event Parking Lots

- production only (49): `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name_1`, `nsc`, `nscn`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (35): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `event`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `type`, `updatedat`, `visible`, `weight`, `zoom`
- both (4): `SHAPE__Area`, `SHAPE__Length`, `name`, `objectid`

### indoor track


**`/0`** - production: Purchase hourly visitor parking | dev: Accessible Parking Spaces

- production only (3): `type`, `x`, `y`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Parking Space | dev: Indoor Track Building

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/2`** - production: Indoor Track Event Parking Lots | dev: Indoor Track Event Parking Lots

- production only (49): `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name_1`, `nsc`, `nscn`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (35): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `event`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `type`, `updatedat`, `visible`, `weight`, `zoom`
- both (4): `SHAPE__Area`, `SHAPE__Length`, `name`, `objectid`

**`/3`** - production: Indoor Track Building | dev: absent

- production only (7): `SHAPE__Area`, `SHAPE__Length`, `a_name`, `event`, `objectid`, `sp_sh_notes`, `type`
- dev only (0): none
- both (0): none

**`/4`** - production: Safety First! | dev: absent

- production only (8): `SHAPE__Length`, `color`, `location`, `objectid`, `pkg_use`, `street_use`, `use_`, `width`
- dev only (0): none
- both (0): none

**`/5`** - production: Team Bus Parking | dev: absent

- production only (7): `SHAPE__Area`, `SHAPE__Length`, `a_name`, `event`, `objectid`, `sp_sh_notes`, `type`
- dev only (0): none
- both (0): none

### mens basketball


**`/0`** - production: Basketball Icons | dev: Basketball Icons

- production only (0): none
- dev only (0): none
- both (34): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `objectid`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`

**`/1`** - production: Basketball Closures | dev: Basketball Closures

- production only (0): none
- dev only (0): none
- both (39): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `event`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `objectid`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `type`, `updatedat`, `visible`, `weight`, `zoom`

**`/2`** - production: Basketball Parking | dev: Basketball Parking

- production only (0): none
- dev only (0): none
- both (39): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `event`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `objectid`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `type`, `updatedat`, `visible`, `weight`, `zoom`

### outdoor track


**`/0`** - production: Purchase hourly visitor parking | dev: Accessible Parking Spaces

- production only (3): `type`, `x`, `y`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Parking Space | dev: Outdoor Track Event Parking Lots

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/2`** - production: Outdoor Track Event Parking Lots | dev: absent

- production only (53): `SHAPE__Area`, `SHAPE__Length`, `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name`, `name_1`, `nsc`, `nscn`, `objectid`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (0): none
- both (0): none

**`/3`** - production: Safety First! | dev: absent

- production only (8): `SHAPE__Length`, `color`, `location`, `objectid`, `pkg_use`, `street_use`, `use_`, `width`
- dev only (0): none
- both (0): none

### soccer


**`/0`** - production: Purchase hourly visitor parking | dev: Accessible Parking Spaces

- production only (3): `type`, `x`, `y`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Parking Space | dev: Soccer Event Parking Lots

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/2`** - production: Soccer Event Parking Lots | dev: absent

- production only (53): `SHAPE__Area`, `SHAPE__Length`, `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name`, `name_1`, `nsc`, `nscn`, `objectid`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (0): none
- both (0): none

**`/3`** - production: Safety First! | dev: absent

- production only (8): `SHAPE__Length`, `color`, `location`, `objectid`, `pkg_use`, `street_use`, `use_`, `width`
- dev only (0): none
- both (0): none

### softball


**`/0`** - production: Purchase hourly visitor parking | dev: Accessible Parking Spaces

- production only (3): `type`, `x`, `y`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Parking Space | dev: Softball Event Parking Lots

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/2`** - production: Softball Event Parking Lots | dev: absent

- production only (53): `SHAPE__Area`, `SHAPE__Length`, `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name`, `name_1`, `nsc`, `nscn`, `objectid`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (0): none
- both (0): none

**`/3`** - production: Safety First! | dev: absent

- production only (8): `SHAPE__Length`, `color`, `location`, `objectid`, `pkg_use`, `street_use`, `use_`, `width`
- dev only (0): none
- both (0): none

### swimming


**`/0`** - production: Purchase hourly visitor parking | dev: Accessible Parking Spaces

- production only (3): `type`, `x`, `y`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Parking Space | dev: Swimming Event Parking Lots

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/2`** - production: Swimming Event Parking Lots | dev: absent

- production only (53): `SHAPE__Area`, `SHAPE__Length`, `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name`, `name_1`, `nsc`, `nscn`, `objectid`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (0): none
- both (0): none

**`/3`** - production: Safety First! | dev: absent

- production only (8): `SHAPE__Length`, `color`, `location`, `objectid`, `pkg_use`, `street_use`, `use_`, `width`
- dev only (0): none
- both (0): none

### tennis


**`/0`** - production: Tennis Symbols | dev: Tennis Event Parking Lots

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/1`** - production: Tennis Event Parking Lots | dev: absent

- production only (53): `SHAPE__Area`, `SHAPE__Length`, `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name`, `name_1`, `nsc`, `nscn`, `objectid`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (0): none
- both (0): none

### volleyball


**`/0`** - production: Purchase hourly visitor parking | dev: Accessible Parking Spaces

- production only (3): `type`, `x`, `y`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Parking Space | dev: Volleyball Event Parking Lots

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/2`** - production: Volleyball Event Parking Lots | dev: absent

- production only (53): `SHAPE__Area`, `SHAPE__Length`, `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name`, `name_1`, `nsc`, `nscn`, `objectid`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (0): none
- both (0): none

**`/3`** - production: Safety First! | dev: absent

- production only (8): `SHAPE__Length`, `color`, `location`, `objectid`, `pkg_use`, `street_use`, `use_`, `width`
- dev only (0): none
- both (0): none

### womens basketball


**`/0`** - production: Purchase hourly visitor parking | dev: Accessible Parking Spaces

- production only (3): `type`, `x`, `y`
- dev only (33): `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `end_date`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `start_date`, `updatedat`, `visible`, `weight`, `zoom`
- both (1): `objectid`

**`/1`** - production: Accessible Parking Space | dev: Women's Basketball Event Parking Lots

- production only (1): `id`
- dev only (36): `SHAPE__Area`, `SHAPE__Length`, `altitude`, `author`, `category_type`, `catid`, `catiid`, `changed`, `createdat`, `custom_data`, `custom_props`, `description`, `edited`, `enddate`, `feed`, `feed_description`, `icon_size`, `keywords`, `labels`, `level_`, `location_open`, `marker_feed`, `mrkid`, `name`, `notes`, `popup`, `popup_url`, `private`, `publishedat`, `reference`, `schedule`, `startdate`, `updatedat`, `visible`, `weight`, `zoom`
- both (3): `event`, `objectid`, `type`

**`/2`** - production: Women's Basketball Event Parking Lots | dev: absent

- production only (53): `SHAPE__Area`, `SHAPE__Length`, `aggiemap`, `baseball`, `baseballn`, `basketball`, `basketballn`, `cit_code`, `cit_code_1`, `citcode`, `f12man`, `fac_code`, `fall_movein`, `fall_moveout`, `feb23n`, `football`, `footballn`, `graduation`, `graduationn`, `indoorn`, `lotname`, `lottype`, `mbasketballn`, `moveinn`, `moveoutn`, `muster`, `mustern`, `name`, `name_1`, `nsc`, `nscn`, `objectid`, `objectid_1`, `objectid_1_1`, `outdoorn`, `soccer`, `soccern`, `softball`, `softballn`, `spring_movein`, `spring_moveout`, `swimming`, `swimmingn`, `tennis`, `tennisn`, `trackindoor`, `trackoutdoor`, `trackxc`, `volelyballn`, `volleyball`, `wbasketball`, `wbasketballn`, `xcounn`
- dev only (0): none
- both (0): none

**`/3`** - production: Safety First! | dev: absent

- production only (8): `SHAPE__Length`, `color`, `location`, `objectid`, `pkg_use`, `street_use`, `use_`, `width`
- dev only (0): none
- both (0): none


## Questions for the GIS team

This file exists so these can be answered against something concrete rather than a description.

1. **Which schema was intended?** The dev views' lots layer carries a generic `event` / `type` /
   `name` / `description` set plus marker-feed fields; production's carries one column per sport. Is
   the generic set the direction, with the per-sport columns being retired - or were they meant to
   come across and did not?
2. **Is the marker-feed accessible layer deliberate?** Production's accessible layer has four fields
   (`objectid`, `id`, `type`, `event`). Dev's has 34, none of them `event` or `type`, and they look
   like a different source entirely (`mrkid`, `feed`, `popup`, `schedule`, `start_date`).
3. **Is the changed sublayer order intended to stay?** Production puts *Purchase hourly visitor
   parking* at `/0`; dev starts at the accessible layer. The maps already carry a per-environment
   index map for this, so it is workable either way - but it should be settled before production is
   republished rather than after.
4. **Indoor track has no Team Bus Parking on dev.** Confirmed correct by the GIS team on 23 October
   2026, and recorded here so nobody restores it.
5. **Safety First! and Purchase hourly visitor parking are absent from every dev view.** Intended?
   The maps no longer request them on dev.

If the answer to 1 and 2 is that the per-sport columns and `event` / `type` are coming back, nothing
in this repository needs to change. If it is that the new schema is the direction, the definitions
have to be rewritten and production republished in the same window, because the two cannot disagree.
