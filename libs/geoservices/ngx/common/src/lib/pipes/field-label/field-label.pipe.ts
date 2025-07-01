import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that safely accesses field label dictionaries by casting string keys to the appropriate enum type.
 * This solves TypeScript strict typing issues when accessing mapped type dictionaries with string keys.
 *
 * @example
 * // In template:
 * {{ item.key | fieldLabel: parsedAddressDict }}
 * {{ item.key | fieldLabel: censusIntersectionDict }}
 *
 * @param key - The string key to look up
 * @param dictionary - The field label dictionary to search in
 * @returns The label string if found, otherwise returns the original key
 */
@Pipe({
  name: 'fieldLabel',
  pure: true
})
export class FieldLabelPipe implements PipeTransform {
  public transform(key: string, dictionary: Record<string, string>): string {
    // Cast the string key to access the strictly typed dictionary
    // This is safe because the keys come from the same enum types used to create the dictionaries
    return dictionary[key as keyof typeof dictionary] || key;
  }
}
