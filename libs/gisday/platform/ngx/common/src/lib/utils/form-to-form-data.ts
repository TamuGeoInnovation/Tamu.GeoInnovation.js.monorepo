import { FormGroup } from '@angular/forms';

export const FormToFormData = (form: FormGroup) => {
  const formValue = form.getRawValue();
  const data: FormData = new FormData();
  const parentFormKeys = Object.keys(formValue);

  const appendValuesToFormData = (keys, childProp?: string) => {
    keys.forEach((key: string) => {
      if (key.lastIndexOf('$') != -1) return; // Eliminates any "omitted" form controls (which we do with a $)
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
