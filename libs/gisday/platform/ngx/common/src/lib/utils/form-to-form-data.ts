import { FormGroup } from '@angular/forms';

export const FormToFormData = (form: FormGroup) => {
  const formValue = form.getRawValue();
  const data: FormData = new FormData();
  const parentFormKeys = Object.keys(formValue);

  const appendValuesToFormData = (keys, childProp?: string) => {
    keys.forEach((key) => {
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
