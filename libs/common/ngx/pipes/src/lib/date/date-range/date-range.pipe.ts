import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateRange'
})
export class DateRangePipe implements PipeTransform {
  public transform(dates: Array<ParseableDate>): string | null {
    if (dates === undefined || dates === null) {
      return null;
    }

    const parsedDates = dates.map((d) => {
      if (typeof d === 'string') {
        return new Date(d);
      }

      if (typeof d === 'number') {
        return new Date(d);
      }

      if (d instanceof Date) {
        return d;
      }

      return null;
    });

    const allValidDates = parsedDates.every((d) => d instanceof Date);

    if (!allValidDates) {
      return null;
    }

    const cleanDates = parsedDates.filter((d): d is Date => d instanceof Date);
    const sortedDates = cleanDates.sort((a, b) => a.getTime() - b.getTime());

    // The goal is to determine the date range from the first date to the last date and display it in a condensed format, so that
    // the user can quickly understand the range of dates.
    //
    // For example, if the dates are [2020-01-01, 2020-01-02, 2020-01-03], the output should be "January 1-3, 2020".
    // If there a broken range, the output should be "January 1-3, 2020, January 5-7, 2020".

    // With every parsed date, group it into year, month, and day buckets.

    const grouped = sortedDates.reduce((acc: any, curr: Date) => {
      const year = curr.getUTCFullYear();
      const month = curr.getUTCMonth();
      const day = curr.getUTCDate();

      if (acc[year] === undefined) {
        acc[year] = {};
      }

      if (acc[year][month] === undefined) {
        acc[year][month] = [];
      }

      acc[year][month].push(day);

      return acc;
    }, {});

    // For each year, month, and day bucket, determine the range of days.
    const ranges = Object.keys(grouped).reduce((acc: any, year: string) => {
      const months = Object.keys(grouped[year]).reduce((acc: any, month: string) => {
        const days = grouped[year][month];

        const ranges = days.reduce((acc: any, day: any, index: number) => {
          if (index === 0) {
            acc.push([day]);
            return acc;
          }

          const lastRange = acc[acc.length - 1];

          if (day - lastRange[lastRange.length - 1] === 1) {
            lastRange.push(day);
          } else {
            acc.push([day]);
          }

          return acc;
        }, []);

        acc.push({
          month: parseInt(month, 10),
          ranges
        });

        return acc;
      }, []);

      acc.push({
        year: parseInt(year, 10),
        months
      });

      return acc;
    }, []);

    // For each year, month, and range of days, format the range of days.
    const formatted = ranges.map((range: any) => {
      const formattedMonths = range.months.map((month: any) => {
        const formattedRanges = month.ranges.map((r: any) => {
          if (r.length === 1) {
            return r[0].toString();
          }

          if (r.length === 2) {
            return `${r[0]}-${r[1]}`;
          }

          return `${r[0]}-${r[r.length - 1]}`;
        });

        return `${this.getMonthName(month.month)} ${formattedRanges.join(', ')}`;
      });

      return `${formattedMonths.join(', ')}, ${range.year}`;
    });

    return formatted.join(', ');
  }

  public getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    return months[month];
  }
}

type ParseableDate = string | number | Date;
