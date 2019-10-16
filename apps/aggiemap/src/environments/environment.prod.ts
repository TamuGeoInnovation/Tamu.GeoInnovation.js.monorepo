// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true
};

import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';

import { Connections, Definitions as d } from './definitions';

export * from './definitions';
export * from './notification-events';

// Persistent layer definitions that will be processed by a factory and added to the map.
export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: d.BUILDINGS.layerId,
    title: d.BUILDINGS.name,
    url: d.BUILDINGS.url,
    popupComponent: d.BUILDINGS.popupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [0, 0, 0, 0.01],
          outline: {
            width: '0'
          }
        }
      }
    }
  },
  {
    type: 'feature',
    id: d.CONSTRUCTION.layerId,
    title: d.CONSTRUCTION.name,
    url: d.CONSTRUCTION.url,
    popupComponent: d.CONSTRUCTION.popupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    legendItems: [
      {
        id: 'construction-legend',
        title: 'Construction Area',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAENJREFUOI1jYaAyYKGZgf9DGf5TahjjagZGFnQBcg2DOYgFmyAlgLYupAYYYgaORsogNHA0Uig3kJIwhAUXC7oApQAAQ8kZ9+L+/N4AAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: d.POINTS_OF_INTEREST.layerId,
    title: d.POINTS_OF_INTEREST.name,
    url: d.POINTS_OF_INTEREST.url,
    popupComponent: d.POINTS_OF_INTEREST.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'points-of-interest-legend',
        title: 'Points of Interest',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAlNJREFUOI291FFIU1EYB/D/XXO36a4xJuhoLFheTCKmrAmZjkAvDEwkDCfYGIP7sIFOhg+CIEKEkQMvDUkW1hR8CNdLDBaxknCIjCkJobBYLqc2rFEJZQ3p2kNM3HZVDOn/dPi+c37nnIdzxDjhiP8raAeoc21trXKV6hohEhXzPL+yHok8uRMKzR8XFD3o7HR9nJvrSk1NFaSyez33WTZBUpTZxnEzR4IOQKJh2fDKyEhVplbn8UCp0cDHMACAtbExdUF5+euxvr5ednDQdShY4XA8i7vdVftrlxkGZWo1AvX1+BEKAQB2YjHindc7NOp0frBznE8QHOroqIu73cbcTR7b7aBUqj0sEz6ZxJdY7JEF8E8Av/LAM0ql61MOJm9qgq69HbqGBrgCAfDJZFb/q99PXbJYrJiYGM0DU9GoNvd0GoMBdS0tKKKo3NZeZArFTQD54LfZ2dO5kxd6e3G1tfVQELu7pZlhFiilaX47HD518ErhiKXSn4JgqV7/OR4Olx0XlMpkb4RBmvbFga7jYJKKCmxtbt4TBBe6u3vOWq3shtcrzdTKzGYUFhUBAC7abHg7MJAFam22Vyan870geBfYCRqNN7ZWV59/n54mAEBWUoKXk5MAALKwEARJYjed/rtBf39KDDTtN/JeCmMyvZjx+1sWafppwuORxDgu75oESeLK8HD0fHV1jba2Nn0oCACG5mZ/JBiUXzAYHq4tL1/fmJ8vTq+vEwq9/rdap0uoKytv1zQ2jgutPfD70jPMNoBbWcWlJWBc0Dka/NecOPgHyxW6W4CVlHsAAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: d.RESTROOMS.layerId,
    title: d.RESTROOMS.name,
    url: d.RESTROOMS.url,
    popupComponent: d.RESTROOMS.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'unisex-restroom-legend',
        title: 'Unisex Restrooms',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAkRJREFUOI29lF1IU2EYx3/bjhOn23T4gTPPURD8yJH2BWV4IYoURgTpReFFXVggdNVF5FUQZBFBRQlhtxZBCKGRQYFEF0p4YUZapqlhbalznp25ze2cbmS2dipx0v/qeZ/n//54ngfeVwB4MzT+2OtVGtAwsFUZDGputrVHAJj/5jvRfHV467B1Pb9S2yoAaMl09os0VJOgV+hud3G43sW1Oy+5/coNwNuuI4yMztLWNQZA3+UaKssLaL/0jP5Jf+yuLtBV7sSZ76CyNAfWgY6sdKwZqTFPRakTScylosT2d2CdmIbnh8y79zOkmgVSTQZCUS3Oc+t0GTNzi/jkVWr2iYxOLDMwHdAH3uioo3pXMQCVFSKCycipmyOxesfRQs6frY+dq1xFSIXZDLT1JQKldBOSmM2SV8aRZWXu6yJ7q4uADeCOfCtu9zJ5eZkAuN3L2G1p+iOfa5Lw+4OIhTkA2O0WLBYzOx0pcVMEQ2HdOAG4f7eIpm3sy26zMDProbVR+n0zf1QcsPPeEPevN8UZPn/x0N0/TcuxagDGJhYoFueRxFyUQJAVf5Dxj9/1gdPeMGZzCuG1CABr4Qi2jDQmV6Ixz91BD5GISmN9FR6PD0UJ0dI5rA+cXIlScLyHqUfNGI0GPk25abg4uOlxE4Dbof8DVAIholEVRQnFcqqqoq6/GM9SCFleZWFRxucL/BvoOvM0IVdy8kks7v0g09vwYPMdJiFVAHDm2V8/vLDnQDL/osGIlmm3vBAADh0sq92uFn8CQJrKeuGe9RUAAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: d.LACTATION_ROOMS.layerId,
    title: d.LACTATION_ROOMS.name,
    url: d.LACTATION_ROOMS.url,
    popupComponent: d.LACTATION_ROOMS.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'lactation-rooms-legend',
        title: 'Lactation Rooms',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAfJJREFUOI211L9rE2EYwPGvEifvIKS0zRVSNRpE01RMLiASpYiCk3QQLyR/gAEzZikBwcFm0NKhHdqhi9JwNwj+gCLUwSFLiXEwjZTEIGS4HjfclCVTHS45ERpyyeEzPcf7vh8ennvfx8d/Ct8gyQaiCazunBfsBKFWpqE7cDYQTZy1ep/gnOStzt5xhqhcpqHbFVvdOe8oANIZuglA943c2o+0VqL945Dqy11X+13BL5p7XIpE4MljzHyOgnTHOzyfTtloP2aCQebTKTpqxRvcUSuY6wYzwSAApmGMRF3BANrmFpcXFwiFw3x9/9HNkdHww80CF69GEP1+AJaWH5FYusvWg6eTw8lilsyz0wGxqvEqqUwGK/ncP9+mYfDr8CdXFq4Tk+Mki9mh128onNZKzg+rf/tOTI7z5d0HPudfA/DmpIWSz40PX7t5w8nrB1XqB1X801OA3SIAQRCGHR8Oz0r2C//dauGfnkJVVkgWs+T2t7l9/x4A7aPm+HD7qElMjnNeFAmFw+T2t9nbeYu4bN8O0zDQ1jbGh7W1DWbX7T4Pei1dCLHzfJV66pbT67HhjlqhoNozIa2VAFCVFWdtVLh6eQNwnPCBPfmhdwx4nck1AoKO1YfLNPQMUbk/pCePgKDvWo2aU/EAB3RPsPU3/QN/+Jj7cGHLggAAAABJRU5ErkJggg=='
      }
    ]
  },
  {
    type: 'feature',
    id: d.SURFACE_LOTS.layerId,
    title: d.SURFACE_LOTS.name,
    url: d.SURFACE_LOTS.url,
    popupComponent: d.SURFACE_LOTS.popupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    native: {
      opacity: 0.001,
      labelingInfo: {
        symbol: {
          type: 'text',
          color: [0, 0, 0, 0.001]
        }
      }
    }
  },
  {
    type: 'feature',
    id: d.VISITOR_PARKING.layerId,
    title: d.VISITOR_PARKING.name,
    url: d.VISITOR_PARKING.url,
    popupComponent: d.VISITOR_PARKING.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'visitor-parking-legend',
        title: 'Visitor Parking',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXlJREFUOI1jYaAyYIExzp2/t+Dth6/2DAz/GUk1hJGR8Z+oEO8MfT2FLriBN26/iIvqPUuyYTBwoMc5k4GBAWHgv/+oLnOQ4WRgZUbVdOXVT4bn3/9hNfDf/3/MDAxIXkYHG+ZFMvDzcaGI/f37j+HWnWcMLf0HGJZd+IBVH04DsQFmZiYGTXUZhqmdgQwvUlcw7Hv0nXQD5y85xJA05RIDAwMDQ76zBENjuSeDAD83Q1GSIcO+hmOUuXDi3hcMbva3GLzcDBlkZYSxqiHJQAYGBgY5qEFfvv0kz0AHG3WGU5pSDAyMjAwSYvwMsjIiDP///2fYsfcGeQYqKogzKCqIw/n//v1jWL/5DEPzxkfkGXjtxmOGZy8gSeTLl58MW/fcYZhz4g1O9QQNPHnmPjyWiQEkR8rgMXD63AMMHBysDMfPvSDPQPRipnLlPZIMYvzP8B/FQBkZwUtzc/S0//8nvTxkYmT8z83NfgjFQHtrLX1SDcIGqB4pABDucZbUZNfrAAAAAElFTkSuQmCC'
      }
    ]
  },
  {
    type: 'feature',
    id: d.ACESSIBLE_ENTRANCES.layerId,
    title: d.ACESSIBLE_ENTRANCES.name,
    url: d.ACESSIBLE_ENTRANCES.url,
    popupComponent: d.ACESSIBLE_ENTRANCES.popupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    legendItems: [
      {
        id: 'assisted-open-entrance-legend',
        title: 'Assisted Open Entrance',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA3pJREFUSInNlVFoW2UUx3+9ye29TToVLzJat+EYCHsocyQPsVCCYbGrtAwELVuQjKHZw7RPfdiTSR722Je8LSK0SgZhDCmxhtA2oNW+zMIeBq0IDm23NNTbh7VNenNvbnxIe5fb29SKCJ63e7/v+//OOd93znHzH5v7fwEYuqb2ap34XNBDg16AXYPcQkZZ+leAgYjqEwUSmsAwDai3rIlu4qGoCpCWdJL5e8qzfwQIR9VEHeLnTwuE+0UCfolur4DXI7BTMVkvGzzfNhmfqMQ0kVg4qiZnp5TEsQChj9RcHYbHRiUuBbvwegTbutcjcO5sJwDzkzLT+R1SWS0eiqo9xSnl5pGAPc+HP491Eezvahegza4MeTlzysX4RCUWjqql1khsgIGI6qtDfGxUcogXF6ps7ZgABN+WeeVll239Yp9MZFAnU9DjAxHVegA2gCiQOH9a4FLQLv7nZp07X1atb1nqYPAdjyOSG1dPkClsIovcBfw2wNA1tVcTGA73i46cLz3SAFC6O1C3G0zP1wgHuxCEDgdkbFQildV8jhRpnfhoQMAv2Q6YZoNv5msAfBaRufNFlV/WTJ78oXPujU4HIOCXSGU1QtfVkeKkkrMALuipA91eu/dPftf59amJqwN8FyTeDejMLBosPqwdCjj5mtvSs0WwX6EH07P4sOl931mB8kad10821x/M1fhgxESW7fsP6jme6U7FtCDVXZMHe+l59JvJx/Eta9+WBo9Xavjfkh3nW80C7BrkRDfx9bJhFdHj5Rpbzfvl1ocSkti81O9+qLGyajL3oxOwXjYsPRtgIaMshaIqz7dfeDD/U9N7/5sC77/ntf67XLDy1S6zPxt8sllHefVFTayVmh2ru0HpsBSlxycqsfnJple3P32J2zjtcsjD5ZCzDsobBvfzGkB6v/nZAJJOUhOJTed3uDLkdQj8nc3MVVleNdEN0vv/bID8PeVZOKomU1ktfuaUi4t9slOljX2/WCVT0HFBstgyJxyvaHZKSYSias/4RCUWGdS5cfXEkcLlDYOZuaY4Jt/Ofm1v2Ye26+KUcjMcVUuZgh7PFDYZG5UI+CWriPbnwVqpzv28xvKqiQuSB8XbAvYjGYioOVnkbiqr+VJZrd3WtG6QLrYZn0eOzL2W6wcIXVdHDs7k7galdqPyWIBWK04quePubbW/AF6HYoeZu0A/AAAAAElFTkSuQmCC'
      },
      {
        id: 'Manual Open Entrance',
        title: 'Manual Open Entrance',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA05JREFUSInNlU+IE3cUxz+/38ykY1JRlFKyENYl0LqLkWazFSzYg8XDQmRP4rWnCKV4qB48SJP04Gn3sjcDglCkrCchLXQRyxaL0JYllJRdKt1WumqoLdLDbjZ/Zn6vhyRjZpPIllLoO8289+b7+b03j9+z+Y/N/l8A2u32mGVZGaVUXETGAJRSZaXU6r8CiEgGKADZnk8p1XvMiwgiUvJ9v+g4ztN/BDDGFID8dt3wcKPF8kqLx88M65uGyYRmesri8EHN3GwsZ9t2zhhT1FoX9gQQkTKQrVQb3LjdYH3ThOLrmybwLS41mb8UJZ1y88aYuNb6wksB3ZNnv36wwyelnVEFhuzyQp2L533mZmM5Y0ytv5IQoNvzfKXa4LMvmsx/FA1i33zf4s59jwMuXP0gSu9P/LDW5tMv2ywuNTl21CE5EcmLSDAAuysobNcNN243eO2AIn3cDQKWrbhz3+P0CZvpPv/WtgBtAHLFLe7dPARwHZgJAdrt9hiQfbjRYn3T8M6UFYh4nnAk4QBwfNIJfLYdTFRglWqDdMrNDLTIsqwMwPJKa+CjJzWP8YTDiTc1ySMOIi98u215pUU65WKMOau1LgcApVQc4PEzM/DRxqOO2LtvR4i/bvHnc5/6zmAewN1Vjyt9egFARMaUUgMjCVBZa3P61D5OnXTRWvHroxb79+uhgH69EKBnkwk9APm26tNoGF6NdUR//Mnj5ExkqPBkIgzub1EZyE9PWQMAzwi/PfF4IxnBGPjqu9GA6e5wdPVCgFUR4fDB4aX//EsH8PsfHrW/ZGgOQHK8I+l5Xi0EABCR0txsLLe41OTBms977z8PYgu3GizcagTvH17bBrZD4mcyNjNvvYKIlHqXXwjg+37Rtu3c/KUolxfqI085ys5lXWJRDVDq+UIAx3GeGmOK6ZSbv3jeZ3GpuWfxj3P7SE5EEJGi1jrYEwNTpLUuGGPic7Ox3LGjDrni1kuFz2RszmVdkhMRgM93X9lDr2ut9QVjTC05Ecnfu3mISrXB8kqLu6seQLAPkuOdnseiunfywm6tkQtHa13o7oXr6ZSbSadcrgzJE5ESUOpvy54A0BldureiMebs7p3seV5t1KrcE6DftNblveb2299DrV3F9KlErwAAAABJRU5ErkJggg=='
      }
    ]
  },
  {
    type: 'feature',
    id: d.EMERGENCY_PHONES.layerId,
    title: d.EMERGENCY_PHONES.name,
    url: d.EMERGENCY_PHONES.url,
    // popupComponent: d.EMERGENCY_PHONES.popupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    legendItems: [
      {
        id: 'emergency-phones-legend',
        title: 'Emergency Phone',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAnxJREFUSIm11U+IVVUcwPHPKeNIq3jQS40xUhTExWwibSBwYzHEGDljjTI5EANugja6kVrMn1xFREKMEtRAihsZdGiR1m4ahBbNRuGBKzcztnjhIvRQclrcnvPe9c3cp9APDpd7z+9+v+ccfpzfJv9jbKpOyTW8FWPek5J6jB6kFFZjtJiSG4SHTwHPr5KnMYpnUwogJe3Pu+TPMUv4u0d4HsEc4fmKbb2ErzFGfpewWgHPH+FbhNFRLl2qwBfxOm6Q97cLOuAx5oGUzE5NCePj9PUxM8P8PKdOVQpewTz5TcI/JXgOKflm61bPHTvG9u3F1507OXmS48e5do3JSW7fXlewHxOYLa98CP0rK4yMcPkyO3asTdbrjI2xbx9DQzQa6wo+JZ8j5PaVv0dREcvLDA8XgnqduTmOHqVWY9cuFhY2FLxcq3mt2fTbI3iMYaBVZu2CvXu5cIGlJc6eXRNcvcqhQ90FzaYB2uAp2VJOWl4uBly8WDxbgt27C8GBA6ysdP4XY96SUueZx66bbItugulpJiYeS91MJ/wP9D2pYHDw8ZyUwt0y/FYv8JZgcLConm3bOHOG06c7Um6V4T/i7V7gJ05w5Mja++HDHfCEX8rwHzCFF6rgi4vcuVNUDcXZHzzI9euQv+eZv0rw8Cd5Bl9UwW/eLOp8YaEQNBotsHuEyVZe+eL6Em9guErQaBSCK1c4fx48jNEHKYVHhVmCh0z+EBkjvQj6+0nJfYynFH5qn+9y5Yb75PfxCT5DbSNBSpZqNR83m+H38tw6zSJkfEX+TtGJ3sEevIgHWCX/GmOYTyn83Gx2p1T00HAP5/4b3Va9YfTQoJ8+/gVFFNSWfmq/aAAAAABJRU5ErkJggg=='
      }
    ]
  },
  {
    type: 'graphic',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    loadOnInit: false,
    visible: true,
    popupComponent: 'BuildingPopupComponent'
  },
  {
    type: 'graphic',
    id: 'bus-route-layer',
    title: 'Bus Routes',
    listMode: 'hide',
    loadOnInit: false,
    visible: true
  },
  {
    type: 'geojson',
    id: d.BIKE_LOCATIONS.layerId,
    title: d.BIKE_LOCATIONS.name,
    url: d.BIKE_LOCATIONS.url,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          size: 8,
          color: '#03C4A6'
        }
      }
    },
    legendItems: [
      {
        id: 'visitor-parking-legend',
        title: 'VeoRide Bikes',
        src:
          'data:image/png;base64,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'
      }
    ]
  }
];

// Static legend items
export const LegendSources: LegendItem[] = [
  {
    id: 'university-building-legend',
    title: 'University Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAJBJREFUOI1jYaAyYIExAtnZGygxaP3Pnw1wAwPZ2RuE7azruYVFyDLsw/2HDCkvXhirKCvPgruQW1iEQUJJmWwXMv386cPAzOzDQlgpaWDUwFEDRw0cZgZ+uP+QbEO+vn3DwIts4PqfPxsCL1xg+HThAgMDAwODsISEMamGimtooLoQVuIyMDAwMDwkw7VQPQDNmyRazmV6EgAAAABJRU5ErkJggg=='
  },
  {
    id: 'non-university-building-legend',
    title: 'Non-University Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHFJREFUOI1jYaAyYIExmpqaGigxqK6urgFuYFNTU4OCBGe9EC8bWYY9ff2doampiaGurq4B7kIhXjYGZWk+sl348sMvBrgLqQlGDRw1cNTAYWbg09ffyTbk3edfqAbW1dU1NDU1wYsgcgBKAYssQCkAABa3ILBI1xApAAAAAElFTkSuQmCC'
  },
  {
    id: 'off-campus-building-legend',
    title: 'Off Campus Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGdJREFUOI3t1KENADEMA8CADhBc2H0802cnLxVUdYRHH7U0LXrVKAo4GbnI4ZTvIGk7EAALkKTVWh9VTWHuLiQFgEVDVZXWWrph712i4clc8IIX/Bno7mlkjLGCAIxkTFAmy8DOj9281XsgH/GbKEkAAAAASUVORK5CYII='
  },
  {
    id: 'garage-parking-legend',
    title: 'Garage Parking',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGtJREFUOI3t1LEOgCAMBNAOTMBgogNfezb3v4YQxdnJRldkMtzUdHi56Zx0jrsPkvoFAqAGktRlntYYfBO25SIkBYBawxi8pLQ0N9z3KtawZwY4wAH+DNxyaUaOer5BAErSJqglr4F9Pr7mAt2qILaQAOa8AAAAAElFTkSuQmCC'
  },
  {
    id: 'restricted-legend',
    title: 'Restricted 6am to 6pm',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAFtJREFUOI1jYKAyYIQxHB0dGygxaP/+/Q0MDAwMLDDDQkMC6+OfviDLsFmiwnBDmWCC5BrGwMDAkPb6LZzNhEcdWWDUwFEDRw0cZgbCiiBywEJpCTib6gUs1QEATW0WjAt6JIYAAAAASUVORK5CYII='
  },
  {
    id: 'paved-surface-legend',
    title: 'Paved Surface',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGVJREFUOI3t1CEOACEMBMAKdF+A4aN7zf62AsMLTl0DtqAurGoqJqu2yOGU7yBpOxAAC5Ck1VofVU1h7i4kBYBFQ1WV1lq6Ye9douHJXPCCF/wZ6O5pZIyxggCMZExQJsvAzo/dvKA4IK9bweSrAAAAAElFTkSuQmCC'
  },
  {
    id: 'sidewalk-legend',
    title: 'Sidewalk',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAEtJREFUOI1jYaAyYIExPr641UCJQfwSag1wA6GG1VNi4McXtxj4JdQaWAgrJQ2MGjhq4KiBowbS0UB+CbWGjy9uUWQQSgGLLEApAAAvoxCdulpoFwAAAABJRU5ErkJggg=='
  },
  {
    id: 'railroad-legend',
    title: 'Railroad',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHhJREFUOI3tkrENgDAMBL+I9EUmYA7WYCfCTLBG5qBz/x0VRUAkAtIg8q3t+7dlh8pyDfgnIMnwBiQpJEBJI8mpMDQAWEnGYkIA0Xs/m9llM8kkTQlYRQnQzEJuHUk9gG5PeqiFBEhyKbnnzE4Jc3e5ow89dgM+1gZwZSYCkyusZQAAAABJRU5ErkJggg=='
  }
];

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

// Search sources used for querying features.
export const SearchSources: SearchSource[] = [
  {
    source: 'building',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number', 'BldgAbbr', 'BldgName'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['BldgName'],
        operators: ['LIKE'],
        wildcards: ['startsWith'],
        transformations: ['UPPER']
      }
    },
    scoringKeys: ['attributes.BldgAbbr', 'attributes.Number', 'attributes.BldgName'],
    featuresLocation: 'features',
    displayTemplate: '{{attributes.BldgName}} ({{attributes.Number}})',
    popupComponent: 'BuildingPopupComponent',
    searchActive: true
  },
  {
    source: 'building-exact',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.BldgName}} ({{attributes.Number}})',
    popupComponent: 'BuildingPopupComponent',
    searchActive: false
  },
  {
    source: 'university-departments',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['DeptName', 'CollegeName', 'DeptAbbre'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.DeptName}}',
    popupComponent: 'BasePopupComponent',
    searchActive: true,
    altLookup: {
      source: 'building-exact',
      reference: {
        keys: ['HOME1']
      }
    }
  },
  {
    source: 'university-departments-exact',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
      resultRecordCount: 100,
      where: {
        keys: ['HOME1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.DeptName}}',
    searchActive: false
  },
  {
    source: 'all-parking',
    name: 'Parking',
    url: `${d.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: false,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.AggieMap,
      GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.SpacePnt_Count.UB,
      GIS.TS.SpacePnt_Count.H_C,
      GIS.TS.SpacePnt_Count.Visitor_H_C,
      TS_GIS.dbo.LOTS.Night_Lot,
      TS_GIS.dbo.LOTS.Visitor_Lot,
      TS_GIS.dbo.LOTS.AVP_Lot,
      TS_GIS.dbo.LOTS.UB_Lot,
      TS_GIS.dbo.LOTS.Break_Lot,
      TS_GIS.dbo.LOTS.Summer_Lot,
      TS_GIS.dbo.LOTS.PrepaidSumm_Lot
      `,
      where: {
        keys: ['1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.LotName}}',
    searchActive: false
  },
  {
    source: 'one-parking',
    name: 'Parking',
    url: `${d.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: true,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.AggieMap,
      GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.SpacePnt_Count.UB,
      GIS.TS.SpacePnt_Count.H_C,
      GIS.TS.SpacePnt_Count.Visitor_H_C,
      TS_GIS.dbo.LOTS.Night_Lot,
      TS_GIS.dbo.LOTS.Visitor_Lot,
      TS_GIS.dbo.LOTS.AVP_Lot,
      TS_GIS.dbo.LOTS.UB_Lot,
      TS_GIS.dbo.LOTS.Break_Lot,
      TS_GIS.dbo.LOTS.Summer_Lot,
      TS_GIS.dbo.LOTS.PrepaidSumm_Lot
      `
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.LotName}}',
    searchActive: false
  },
  {
    source: 'parking-garage',
    name: 'Parking Garage',
    url: `${Connections.basemapUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName', 'Name'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.LotName}}',
    popupComponent: 'BuildingPopupComponent',
    searchActive: true
  },
  {
    source: 'parking-lot',
    name: 'Parking Lot',
    url: `${Connections.basemapUrl}/12`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.LotName}}',
    popupComponent: 'ParkingLotPopupComponent',
    searchActive: true
  },
  {
    source: 'points-of-interest',
    name: 'Points of Interest',
    url: `${Connections.inforUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Name'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.Name}}',
    popupComponent: 'PoiPopupComponent',
    searchActive: true
  },
  {
    source: 'bike-racks',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`,
    queryParams: {
      ...commonQueryParams,
      resultRecordCount: 9999,
      where: {
        keys: ['1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.Type}}',
    searchActive: false
  }
];

export const SelectionSymbols = {
  polygon: {
    type: 'simple-fill',
    style: 'solid',
    color: [252, 227, 0, 0.55],
    outline: {
      color: [252, 227, 0, 0.8],
      width: '2px'
    }
  },
  point: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  },
  multipoint: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  }
};
