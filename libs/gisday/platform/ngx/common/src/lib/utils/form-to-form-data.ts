import { UntypedFormGroup } from '@angular/forms';

/**
 * Takes a standard Angular FormGroup and will return a FormData object useful
 * for multipart HTTP requests
 *
 * A value that is false is sent, as "false" (#3327): a checkbox turned off has to reach the API to be saved. An empty or
 * missing value is still left out.
 * @param form
 * @returns FormData
 */
export const formToFormData = (form: UntypedFormGroup, stringifyObjects?: boolean) => {
  const formValue = form.getRawValue();
  const data: FormData = new FormData();
  const parentFormKeys = Object.keys(formValue);

  // Will iterate through a form group object and return a flattened FormData representation.
  // Needs some work to make it more generic using plain objects and could use some work in recursion.
  const appendValuesToFormData = (keys, childProp?: string) => {
    keys.forEach((key: string) => {
      if (key.lastIndexOf('_') === 0) return; // Eliminates any "omitted" form controls (if a form control has _ as the beginning character)

      if (formValue[key] || formValue[key] === false) {
        if (typeof formValue[key] == 'object' && formValue[key] instanceof File === false) {
          if (stringifyObjects) {
            data.append(key, JSON.stringify(formValue[key]));
          } else {
            appendValuesToFormData(Object.keys(formValue[key]), key);
          }
        } else {
          data.append(key, formValue[key]);
        }
      } else if (childProp) {
        if (formValue[childProp][key] || formValue[childProp][key] === false) {
          if (typeof formValue[key] == 'object') {
            appendValuesToFormData(Object.keys(formValue[key]), key);
          } else {
            data.append(key, formValue[childProp][key]);
          }
        }
      }
    });
  };

  appendValuesToFormData(parentFormKeys);

  return data;
};
