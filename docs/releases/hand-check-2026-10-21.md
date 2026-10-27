# Hand check: the 21 October 2026 release, on dev

**For whoever is checking this release before it goes to the public site.** You do not need to know
anything about the code. Everything here is done in a browser.

**Where:** <https://dev.aggiemap.tamu.edu> - the **dev** site, not the public one. Every link below is a
dev link. If a link ever shows `aggiemap.tamu.edu` without `dev.`, you are on the public site and looking
at the old version.

**What this is:** an automated suite already ran against this build and passed 618 checks. It cannot see
whether something *looks* right, which is what you are doing. If the automated suite missed something, you
are the one who finds it.

**Roughly 30–40 minutes.**

> **A wrong address does not show an error.** This app renders the main map for any address it does not
> recognise, so a mistyped link looks like a working page with nothing on it. If a map looks like the
> ordinary campus map rather than the one you expected, check the address before reporting the map as
> broken.


## How to record what you find

Put a ✅ or a ✗ in the last column, and for anything that is not ✅ **write what you actually saw** - not
"broken", but "the lots are there but clicking one opens the wrong box". A description of what you saw is
useful even when you are not sure it is wrong.

**If something looks wrong, do not try to fix it and do not stop checking.** Note it and carry on; one
odd thing does not mean the rest is fine. Send the finished table back to Dan.

**Two things that are not faults:**

- A map can be **blank for 20 to 40 seconds** while it draws. That is normal. Give every map a minute
  before deciding anything is missing.
- A **notice may appear and vanish** after about ten seconds. That is deliberate. If you want to read it,
  hover the mouse over it to stop it closing.

---

## 1. The reason for this release: the athletics maps know their new dates

Until this build, these maps thought their season had finished and said so. **Women's basketball starts on
2 November**, so this is the part that matters most.

| # | Open this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 1.1 | [Women's Basketball](https://dev.aggiemap.tamu.edu/events/womens-basketball) | The map opens normally. **No box saying "This event has passed."** | |
| 1.2 | [Men's Basketball](https://dev.aggiemap.tamu.edu/events/mens-basketball) | The same - no "event has passed" box | |
| 1.3 | [Baseball](https://dev.aggiemap.tamu.edu/parking/baseball-parking) | The same | |
| 1.4 | [Soccer](https://dev.aggiemap.tamu.edu/parking/soccer-parking) | The same | |
| 1.5 | [Volleyball](https://dev.aggiemap.tamu.edu/parking/volleyball-parking) | The same | |
| 1.6 | [Tennis](https://dev.aggiemap.tamu.edu/parking/tennis-parking) | The same | |
| 1.6a | [Football, Game Day Parking](https://dev.aggiemap.tamu.edu/events/gameday-parking) | The same. **Note the address**: this map is `/events/gameday-parking`, not `/parking/football-parking` | |
| 1.6b | [Swimming](https://dev.aggiemap.tamu.edu/parking/swimming-parking) | The same | |
| 1.7 | [Softball](https://dev.aggiemap.tamu.edu/parking/softball-parking) | The same | |

> Some campus-event maps **do** still show "This event has passed" - Muster, Big Event, MS150 and others.
> That is known and is not part of this release. Only the sports maps above are expected to be fixed.

## 2. Links to a particular parking lot

A link with `?lot=` should open **that map's own** lot. Until this build it often opened the main campus
map's lot instead, for a moment or for good.

| # | Open this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 2.1 | [Visitor Parking, lot 100j](https://dev.aggiemap.tamu.edu/parking/visitor-parking/map?lot=100j) | A lot is highlighted and a panel opens for it. The panel is headed **Visitor Parking**, not "Selected Buildings". Reload the page two or three times - it should be the same every time | |
| 2.2 | [Motorcycle Parking, lot 100j](https://dev.aggiemap.tamu.edu/parking/motorcycle-parking/map?lot=100j) | The same, headed **Motorcycle Parking Space** | |
| 2.3 | [The main map](https://dev.aggiemap.tamu.edu/map/d). **Type `Wehner` in the search box, then click the Wehner Building result** - the link alone opens the map with nothing selected, which is correct | The normal **building** panel opens, headed by the building name. This case should be *unchanged*: if it says "Selected Buildings" or shows parking fields, that is a regression | |

## 3. Indoor Track's team bus area

This was checked earlier today and **was wrong** - the area was drawn but completely hidden underneath the
building on top of it. It has been fixed since, so this is the one to look at most carefully.

| # | Open this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 3.1 | [Indoor Track](https://dev.aggiemap.tamu.edu/parking/indoor-track-parking) | A **magenta / bright pink area** over the Indoor Track building, visible as soon as the map finishes drawing - you should not have to switch anything off to see it | |
| 3.2 | Same map, in the Legend | Entries for **Accessible Parking Spaces** and **Team Bus Parking**, each with a coloured symbol beside the name, not just text | |
| 3.3 | Same map - click a wheelchair marker | A panel opens for that parking space | |

## 4. Maps that draw their lots and symbols

These were each broken in a different way and were fixed over the last few days.

| # | Open this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 4.1 | [Business Parking](https://dev.aggiemap.tamu.edu/parking/business-parking) | Maroon lots and pink garages drawn across campus, plus blue triangles. In the Legend, **all three** entries have a symbol | |
| 4.2 | [Vendor Parking](https://dev.aggiemap.tamu.edu/parking/vendor-parking) | Maroon lots and lavender garages. **Click a lot** - the panel should be the vendor notes for that lot, not a general campus lot | |
| 4.3 | [Freshman Selectable Parking](https://dev.aggiemap.tamu.edu/parking/permit-select-freshman) | Both legend entries have a **coloured square** beside the name, not just the name | |
| 4.4 | [Softball](https://dev.aggiemap.tamu.edu/parking/softball-parking) | The Accessible Parking Spaces legend entry has a wheelchair symbol under it | |
| 4.5 | [Women's Basketball](https://dev.aggiemap.tamu.edu/events/womens-basketball) | Wheelchair markers drawn on the map, and an Accessible Parking entry with a symbol in the Legend | |

## 5. Aerial imagery

| # | Open this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 5.1 | [The main map's settings](https://dev.aggiemap.tamu.edu/map/d/settings), choose **Aerial Imagery** | Photographs of campus appear. **Do this three or four times with a fresh page each time** - it used to come up blank about one time in three | |
| 5.2 | Same, then move the date slider | Older imagery appears, and moving it back to Latest returns to the newest | |

## 6. The cancelled concert

| # | Open this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 6.1 | [Campus Events](https://dev.aggiemap.tamu.edu/all-maps/campus-events) | **No "Live at the Station"** in the Fall column. Every other event still listed | |
| 6.2 | Search the site for `live at the station` | Nothing offered | |
| 6.3 | [The old link](https://dev.aggiemap.tamu.edu/events/live-at-the-station) | It still opens a map rather than an error page. (Someone may have the old link saved) | |

## 7. The keyboard

New in this build: the map controls can be used without a mouse.

| # | Do this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 7.1 | [The main map](https://dev.aggiemap.tamu.edu/map/d) - press **Tab** repeatedly | A visible outline moves between the buttons and controls. You can reach the zoom buttons, the layers and the search box | |
| 7.2 | Tab to a button and press **Enter** or **Space** | It does what clicking it does | |

## 8. On a phone

Use an actual phone if you can; otherwise make the browser window narrow.

| # | Open this | What is right | ✅ / ✗ |
| --- | --- | --- | --- |
| 8.1 | [The main map](https://dev.aggiemap.tamu.edu/map/d) | Nothing runs off the side of the screen; no sideways scrolling | |
| 8.2 | ☰ → Basemap → Aerial Imagery | The imagery draws | |

---

## If you have time: anything that looks wrong anywhere

The checks above are the changes in this release. If you notice anything else odd on any map - a layer
that draws nothing, a legend entry with no symbol, a panel with `{something}` in it instead of real text -
**write it down**. Several of the fixes in this release were found exactly that way, by somebody looking
at a map for an unrelated reason.

---

**Release:** Azure Release-489, build 20261021.16. Cleared on dev from `61161ce1b`, tagged
`dev-2026-10-21`; promoted to production from `36b962a04`, tagged `prod-2026-10-22`. The two differ
by three GIS Day commits and these notes, and by no AggieMap code - see the
[release notes](2026-10-21.md).
**Checked by:** ______________________ **Date:** ______________
