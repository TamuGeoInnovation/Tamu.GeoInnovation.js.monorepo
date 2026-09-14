import { FeatureLayerSourceProperties, LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import esri = __esri;

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum T_CAMP_LAYERS {
  CAMPUS_LOCATIONS = 't-camp-campus-locations',
  ENTRY_ROUTE = 't-camp-entry-route',
  CLOSURES = 't-camp-closures',
  PARKING = 't-camp-parking'
}

const tCampUrl = Connections.tCampUrl;

// Every feature in the service carries a rich, pre-formatted HTML `description` along with a `name`,
// so a single name/description popup works for all four layers.
const popup = {
  popupComponent: MarkdownPopupComponent,
  popupData: {
    name: { field: 'name' },
    description: { field: 'description' }
  }
};

/**
 * Picture-marker art from the service's published renderer, inlined because the hosted view's image
 * endpoint (`/0/images/<hash>`) returns 400, which left the markers and legend swatches blank.
 */
const BUS_PARKING_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAoCAYAAACfKfiZAAAACXBIWXMAAAFiAAABYgFfJ9BTAAAFvmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94' +
  'cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIg' +
  'eDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1s' +
  'bnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1s' +
  'bnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5z' +
  'OnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEu' +
  'MC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0i' +
  'QWRvYmUgUGhvdG9zaG9wIDI1LjExIChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTAtMDNUMTI6MDM6MjAtMDU6MDAiIHhtcDpNb2RpZnlE' +
  'YXRlPSIyMDI0LTEwLTAzVDEyOjI4OjM1LTA1OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTEwLTAzVDEyOjI4OjM1LTA1OjAwIiBkYzpmb3JtYXQ9' +
  'ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4MGM2YzY0Yy1jM2FmLTY3NDUtYWJmMi0x' +
  'ZjM2MmUxZTc1MDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTIxNGEzNGYtNmRlMi1mODQ4LTk4NzktMDZiZjFlYjc3ZWViIiB4bXBNTTpPcmln' +
  'aW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OTIxNGEzNGYtNmRlMi1mODQ4LTk4NzktMDZiZjFlYjc3ZWViIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2Vx' +
  'PiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5MjE0YTM0Zi02ZGUyLWY4NDgtOTg3OS0wNmJm' +
  'MWViNzdlZWIiIHN0RXZ0OndoZW49IjIwMjQtMTAtMDNUMTI6MDM6MjAtMDU6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAy' +
  'NS4xMSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjgwYzZjNjRjLWMzYWYt' +
  'Njc0NS1hYmYyLTFmMzYyZTFlNzUwOSIgc3RFdnQ6d2hlbj0iMjAyNC0xMC0wM1QxMjoyODozNS0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRv' +
  'YmUgUGhvdG9zaG9wIDI1LjExIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVz' +
  'Y3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6ZEiWrAAAEF0lEQVRYw71YS09TQRTuT+hPYIG47U/oyoSd' +
  'QRc+ElLiI1C4gsjDGAndGVCTJuJrY5p0oRFNqiwQQdvwiFVe1RBF1FigIBFKbnm0gUDH+ZoZmI73DTrJCaW3M+c75zvnzDnXRQhxWRG6vFSCVBJUiIao' +
  'VGJUGqiUWD7XgmIflaTXe4xU13UuKc1PU/7W3mxNax8RpbalZ1VpCs9VVjVlS0uPEAbG6xgAXR5YW1FRSZTmJ0uyQiMBQKXx4RIDEqLitgUAVmOzvz64' +
  'rKek69H4pCh6QOAReBAGWQIA5eXlFaSu5XmR8vq2gczb4dno1tbOF6KzVtLZd5FXM4MykLrL99MsRjyGALhymePoyGwsnycZYnHt7OQXws+m4jogSjQB' +
  'AB3cLlmurm9sT+JQAKCfJ6zI9vbuD+yZX1wbKqKEUoq40gOQEDlvbH+Toe6e5gfhfzuB2NEVn97dzS/KIBDUVFegCABcjwfiD7nl9JB56fAglYCBRPhv' +
  '74UmCmd8/Z6O7afrS5VR4RYBJMVUA+ecT3EzKDFRXgQAwhfA8O9YZgSYbpcXRUZ0PeVb5RvHPv6K2nG9LHyJnkScwWgOIIgKp2W9CKC7Zzq6vrE1akV+' +
  'r2wOM28VZYeYGTCaFTtXAuWVP+CBJwPAwcTGuv3gw5gMQAzI8xfbV0EDABTlvbwOE4BIg7/+ToqVaReRo/ZfAcDai4Pm7iS7sP4vAJ4NtgG03xz6HB9f' +
  '6Lcir2M/B/QoRYFyBOCgaShTgMDnAFQ0E2ZBiPpgVpL9Vwu35qeR0VRC6zwxCKuVW0nWYbli6GT4g5XVbFwLAHJYzmVZLl3vJ3MLa2EUskjvTM4oDU+d' +
  'qSGs23I1oDTyBy/6vg3pUdDWMZiy4HY13D2V7Lz7/i8PiOWYdUslAFBS6H6EWgBX8U0oTHZ5pzQR5Vp/IeD4Objc9vinHufXMr+MIujh+A+4u7W44zel' +
  'lsB7ep7k0S9cyT4RgFf2AvgSD+DBh7+6LRmNH74ft6gWjUpTaO8ikhuSkBgLMghQgRiQ7wp5YY9ovRh41MAc496nBcANZOjdRBCiJXaXXENOn/VvIvWM' +
  'mlJPWdnRjNwRI3rFwDRbiAeR80Le195Q5X7QsC3Xmn4QnHCpFhh8h2diqu1XvcfLWh2x0WASgrvM0g3KZEs1hhPOu9fOZOSWu2SnAm+KXbCd2RBVSqXx' +
  'kHaq/NyFthxKvePpmK7jrD7k7Cpn+a4aDaZWx/OgPDOYCXp/xrvnwO8H+NSENLIGoHeT8d5wKC8ohKBUkU5mANjQETm0NyTiKxq4Fe7VU84m4IQZ744A' +
  'MBABuFdTOc0WVFErvDsGwK9upJf8JoRNOj7b5zkAULi0MNkoVx5FqNtjJ05WbaB62j3LEQABRIDledKJ5Vz+AI5v+KQ4gjUnAAAAAElFTkSuQmCC';

const WILLIAMS_ALUMNI_CENTER_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAoCAYAAACfKfiZAAAACXBIWXMAAAFiAAABYgFfJ9BTAAAFzGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94' +
  'cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIg' +
  'eDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1s' +
  'bnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1s' +
  'bnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5z' +
  'OnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEu' +
  'MC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0i' +
  'QWRvYmUgUGhvdG9zaG9wIDI1LjEyIChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTAtMDhUMjM6MzA6MjEtMDU6MDAiIHhtcDpNb2RpZnlE' +
  'YXRlPSIyMDI0LTEwLTA5VDAwOjE1OjE1LTA1OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTEwLTA5VDAwOjE1OjE1LTA1OjAwIiBkYzpmb3JtYXQ9' +
  'ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiNDU5YWZjZS00ZmRiLWNmNGMtODAwYS1l' +
  'MDZmNjk0ZDYwYmIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo1MDc3MDU3NS1mOTdmLThjNDEtYWQwYS1mZDRjODY0MmIz' +
  'MmMiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkOGYzNDNlYy0yZjg3LTIwNGMtYWI1Yi0xOTFhZDE0ZmE1NmEiPiA8eG1wTU06SGlz' +
  'dG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ4ZjM0M2VjLTJmODct' +
  'MjA0Yy1hYjViLTE5MWFkMTRmYTU2YSIgc3RFdnQ6d2hlbj0iMjAyNC0xMC0wOFQyMzozMDoyMS0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRv' +
  'YmUgUGhvdG9zaG9wIDI1LjEyIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6' +
  'YjQ1OWFmY2UtNGZkYi1jZjRjLTgwMGEtZTA2ZjY5NGQ2MGJiIiBzdEV2dDp3aGVuPSIyMDI0LTEwLTA5VDAwOjE1OjE1LTA1OjAwIiBzdEV2dDpzb2Z0' +
  'd2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMTIgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0' +
  'b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ps+PhUIAAAYbSURBVFjDrViLU1RV' +
  'GN9/wMZSFxSERXZ3EJXIyUepiS8QUNAyI01Zs8BHJgoq6eQwaj5CjVpQoER0zGcqOgPoZEY2CmrpKmmNjbIp5IOHKyNPhV/nO927nbsvdjfOzDd79557' +
  '7vf73t93VQBU7hBbEYyyGJkYwQFZGJUxSmGkcfu9bjA2MDL7qtWYOEhfG6cLbJiq7t0e2+tFiBTn5/s0RhtYM3pQSHOPHi9AAhPhNQC2wknaQdpgxOk0' +
  'FluGrmhKn15tkTrNAwlIIaOeHgEgqelwZKiuwRmTxWNGKsjhc71faiGNkAZJILcAEHOtJhBxGv9G8WVv9u+HzYkJuHqmFM5WcZ4Ra2dMsQMSqdfUSz4S' +
  '7hKAzHyqT59n4guI8eMHf8PdVWX6BSsmj3MGQuMQAKEjtYuSk9Q/Hd5nx+D58+e4U1mJitJS3KiowI3yC7h5sQKWulrFc4e2rFOAmKAfUEt+5QyAadJA' +
  'bb3I3FbdHR0dKNldgMzkJGQt+QgZCQko3rULiWGDMTtEjxmB/VFSUOASBDk145WhAECqpw3xQVvJW5ubsWNlGk7k5eL29WswLk9h/1dgul9fpE6ORMqE' +
  '8TiWbURqVCQeP3yoOFuwJtX63hh1b4tkip4iAHPsAP860ebiampsRG76Khz+YjtyVqQhQReMYzlGxPf1wZrp8fg86UNsmmfAlbNnuVnWvzcLbS0tineI' +
  'kSJFRobEWxVBSUZUvehwnZ2dOLA1E3s/24A5oSHW5348cpj/7mRaSBr+KpJHDsfMoEAkjxiGRaNfx5Evs/hZ0THls9H91OQLZhlA1riBwQ+cSX8sOxsn' +
  'cndill6nMFExszX9FmSsxbzwMG6G1dOnYd3sWdwXFo56zc55xcggoaVkpzLFBvndlzdExyMJrp07h/lDX7GL7dI9hfz3EDPLu3ot5g4O5Y44c4AG8b5q' +
  'GF4egvbWVqcOOTZU30BmIACUOlvkDYE7B2Bcvsxhlju4LRMG5v2JjHHZ0e/4PYqGd4KD+PXyyIlYNmkCOljIOjLDRH1QtZSmVYr0auXPQo4AOEvFb2sC' +
  'UFK4m19vNCQif3W63f6SsWMUAGhZ/cDf1ywVLO8AEJG9N79v4NdLx4+DcdlSLjU5I907mZ+ncEQxGroE0CEBWDByhEsQFPdbFySzs6MU98kHKGfYApg/' +
  'NMxNDXT+C+DnouPYtjAZWz6Yj9XT4pEeNxUrY2N43BNjygNvBfjz3ECOaO0PfPqw1FxnFwlWEwT0rZYBWGLUvRrsnFCKgv2ZW/BbeTke3buH+1V3UFtd' +
  'jYd3/0LlhfM4vnMHjhq/wu3K69i3eRP2rF/HktBsDpDM8P3+b53mgvEhwWapw1KVRQX535U3Sr7OsTKnVXn+PHLSUnHp9GnkfZKOPy5ftu7dr6rCxsS5' +
  'aG1qYnlhFy6eKsWtK1dwfEcOykuK8fjRIwUAMQyHsaQmdVuqFEqN8gbVc9ERfzh0EKwFw/bFi7BqSiyP+Q1z5/D9upoaHvONDfW8JtxgmvrTdBWn9u7B' +
  'mQMH7NQvpmOpW9IQAA39YTetIKqu/ao4eO/WLaRFTxZbLi7Zs/Z2fPPpGtTWVPP0SxXyZH4uqx1P7JhTcZPPk8blsiwXoyLq4eQHKGU6Ws/a2hizGph/' +
  'v8nr/81LF/k13aNq6WrJ3i+UZIMIIMJWC2Sv7lrZHyf9J31wgLUQ2TYkhaIvdBcIRUPCmlTJ9gZHAHoSMurdRBDUTHSH5EQjQkOaKPRcNaXUFz6hem3b' +
  'glMMu7vI4USbE0UM1Fps+0GXbbnoD6JzkkodgaF7tOdoRojW+NU66ohdDSaFpK6uJiBiZiupo+FEsnuEJ5MR+YOJ2mhPRjJHRNoUu2BPZkPKUpZoP596' +
  'b5m/EapvoVTv9XTM1jSeH5gaPWUuxbvF1WDq7nieZTszdEXU+0t2D//f3wfkqYnCyE0ATZLdU7rlA4XglBYKp64ASENHUbd9IRE/0ZBaSb3OmEsTsKkr' +
  'u3sFQAKRISUp+2TDooWyqDt29xqAXLopvGwANEuTjsHj93kBgBctmmyitIFFk/RBZUN02qeUPT19l1cABBAZUpybvZFcpn8AdBzrO5TWGMkAAAAASUVO' +
  'RK5CYII=';

// The Campus Locations picture markers are pin-shaped (natural 32x40, ~0.8 ratio) but the published
// renderer forces them into a 30x30 square, which stretches them on the map. Re-render each at a
// matching 0.8 ratio (24x30) to remove the distortion. Keyed by the `name` field that the service's
// unique-value renderer already classifies on.
const CAMPUS_LOCATION_ICONS: Array<{ value: string; imageData: string }> = [
  { value: 'Bus Parking', imageData: BUS_PARKING_IMAGE_DATA },
  { value: 'The Williams Alumni Center', imageData: WILLIAMS_ALUMNI_CENTER_IMAGE_DATA }
];

const campusLocationsNative: NonNullable<FeatureLayerSourceProperties['native']> = {
  outFields: ['*'],
  renderer: {
    type: 'unique-value',
    field: 'name',
    uniqueValueInfos: CAMPUS_LOCATION_ICONS.map(({ value, imageData }) => ({
      value,
      symbol: {
        type: 'picture-marker',
        url: `data:image/png;base64,${imageData}`,
        width: 24,
        height: 30
      } as unknown as esri.PictureMarkerSymbolProperties
    }))
  }
};

// Match the on-map fix in the legend: pull the (now correctly proportioned) icon from the renderer
// and render the swatch at the same 0.8 ratio so it isn't stretched square either.
const campusLocationsLegend: NonNullable<LayerSource['legend']> = {
  mode: 'renderer-symbol',
  preserveAspectRatio: true,
  fit: 'contain',
  width: 24,
  height: 30
};

// The entry route is directional, so render it as a green line with an arrowhead at the end to show
// the direction of travel. Green matches the published renderer color.
const entryRouteNative = {
  outFields: ['*'],
  renderer: {
    type: 'simple',
    symbol: {
      type: 'simple-line',
      color: [38, 115, 0, 255],
      width: 4,
      marker: { style: 'arrow', color: [38, 115, 0, 255], placement: 'end' }
    }
  }
} as unknown as NonNullable<FeatureLayerSourceProperties['native']>;

export const TCampColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: T_CAMP_LAYERS.CLOSURES,
    title: 'Closures',
    url: `${tCampUrl}/2`,
    visible: true,
    listMode: 'show',
    ...popup,
    native: {
      outFields: ['*'],
      // Layers 2 and 3 are the same five features (three lots, two closures). Filter each one here so
      // it doesn't rely on the published unique-value renderer to hide the other layer's features.
      definitionExpression: `type = 'Closure'`
    }
  },
  {
    type: 'feature',
    id: T_CAMP_LAYERS.PARKING,
    title: 'Parking',
    url: `${tCampUrl}/3`,
    visible: true,
    listMode: 'show',
    ...popup,
    native: {
      outFields: ['*'],
      definitionExpression: `type = 'Parking'`
    }
  },
  {
    type: 'feature',
    id: T_CAMP_LAYERS.ENTRY_ROUTE,
    title: 'Entry Route',
    url: `${tCampUrl}/1`,
    visible: true,
    listMode: 'show',
    ...popup,
    native: entryRouteNative
  },
  {
    type: 'feature',
    id: T_CAMP_LAYERS.CAMPUS_LOCATIONS,
    title: 'Campus Locations',
    url: `${tCampUrl}/0`,
    visible: true,
    listMode: 'show',
    ...popup,
    legend: campusLocationsLegend,
    native: campusLocationsNative
  }
];

export const TCampConfiguration: EventConfiguration = {
  id: 't-camp',
  name: 'T Camp',
  applicationName: 'T Camp Parking & Transportation Map',
  shortApplicationName: 'T Camp Map',
  introductionText:
    'Find parking, entry routes, and closures for T Camp. Use the map to plan your drop-off and pickup.',
  eventDates: [],
  scheduleUrl: 'https://transport.tamu.edu/Parking/Events/camp.aspx',
  // The Williams Alumni Center sits ~570m southwest of the lots, so the initial view has to cover the
  // full extent of all four layers (~460m x ~575m) rather than framing the lots alone. Centered on
  // that combined extent at the zoom level that fits it.
  mapCenter: [-96.33368, 30.61101],
  zoom: 17,
  legendAllowVisibilityToggle: true
};

export const TCampOptions: SpecialEventOptions = [];

export const TCampTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: TCampConfiguration,
  options: TCampOptions,
  sources: TCampColdLayerSources,
  references: T_CAMP_LAYERS,
  discover: {
    id: TCampConfiguration.id,
    name: TCampConfiguration.name,
    description: 'Parking, entry routes, and closures for T Camp.',
    source: 'internal',
    type: 'event',
    mapType: 'campus',
    columnKey: 'summer',
    keywords: ['t camp', 'tcamp', 'transfer camp', 'new student', 'parking', 'transportation', 'closures', 'entry route']
  }
};
