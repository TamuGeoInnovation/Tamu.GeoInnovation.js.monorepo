import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumberFormat'
})
export class PhoneNumberFormatPipe implements PipeTransform {

  transform(value: string): any {
    const phoneNumber = value.replace(/[^\d]/g, "");

    if (phoneNumber.length === 10) {
        return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1)$2-$3");
    }

    return value;
  }

}
