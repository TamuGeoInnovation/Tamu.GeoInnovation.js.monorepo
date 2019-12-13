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