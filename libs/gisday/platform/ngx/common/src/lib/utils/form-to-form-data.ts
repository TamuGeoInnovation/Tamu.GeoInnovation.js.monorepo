import { FormGroup } from '@angular/forms';

/**
 * Takes a standard Angular FormGroup and will return a FormData object useful
 * for multipart HTTP requests
 * @param form
 * @returns FormData
 */
export const formToFormData = (form: FormGroup) => {
  const formValue = form.getRawValue();
  const data: FormData = new FormData();
  const parentFormKeys = Object.keys(formValue);

  // Will iterate through a form group object and return a flattened FormData representation.
  // Needs some work to make it more generic using plain objects and could use some work in recursion.
  const appendValuesToFormData = (keys, childProp?: string) => {
    keys.forEach((key: string) => {
      if (key.lastIndexOf('_') === 0) return; // Eliminates any "omitted" form controls (if a form control has _ as the beginning character)
      if (formValue[key]) {
        if (typeof formValue[key] == 'object') {
          appendValuesToFormData(Object.keys(formValue[key]), key);
        } else {
          data.append(key, formValue[key]);
        }
      } else if (childProp) {
        if (formValue[childProp][key]) {
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
