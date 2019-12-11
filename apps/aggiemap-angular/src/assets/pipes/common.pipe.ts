import { Pipe, PipeTransform } from '@angular/core';

//
// Accepts an array of objects and returns those which evaluation is truthy
//

@Pipe({
  name: 'searchResult'
})
export class SearchResultPipe implements PipeTransform {
  public transform(value: Array<{ attributes: {} }>, compareValue: string, compareKey: string): {} {
    const ret = [];

    // Simple check to see if data was passed in or not
    if (value) {
      value.forEach((element) => {
        if (element.attributes[compareKey] !== null) {
          if (element.attributes[compareKey].includes(compareValue)) {
            ret.push(element);
          }
        }
      });
    }

    return ret;
  }
}

//
// For directions returned from an ArcGIS routing service, return feet units if a predefined threshold is met
//

@Pipe({
  name: 'routeDirectionTransformer'
})
export class RouteDirectionTransformerPipe implements PipeTransform {
  public transform(value) {
    const units = this.resolveUnits(value);

    const transformedDirection = this.modifyDirections(value, units);

    return transformedDirection;
  }

  public modifyDirections = (direction, units) => {
    // If path length is greater than zero, return populated string, else nothing to prevent "for 0 [units]"
    if (units.travelLength > 0) {
      if (direction.text.includes('Curb_Cut')) {
        direction.text = 'Cross street';
      }

      if (direction.text.includes('Unverified_Sidewalk')) {
        direction.text = 'Follow sidewalk';
      }

      return `${direction.text} and continue for <strong>${units.travelLength} ${units.displayUnit}</strong>.`;
    } else {
      return `${direction.text}`;
    }
  };

  public resolveUnits = (direction) => {
    const ret = {
      displayUnit: 'miles',
      travelLength: 0
    };

    // Simple check to see if data was passed in or not
    if (direction) {
      ret.travelLength = direction.length;

      // If path length is less than 500 feet, switch to feet instead of miles
      if (direction.length < 0.094697) {
        ret.displayUnit = 'feet';

        // convert miles to feet and trim decimals (i.e. 343 feet)
        ret.travelLength = parseInt((ret.travelLength * 5280).toFixed(0), 10);
      } else {
        // Limit mile length to 2 decimal places (i.e. 2.25 miles)
        ret.travelLength = direction.length.toFixed(2);
      }

      return ret;
    } else {
      throw new Error('Direction object not provided');
    }
  };
}
