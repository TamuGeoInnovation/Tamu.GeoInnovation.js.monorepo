import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  constructor() { }

  public generateFakeData(numOfValues: number): Observable<LeaderboardItem[]> {
    const data = Observable.create((observer) => {


      const firstNames: string[] = ['Aaron', 'Barbara', 'Edgar', 'Dan', 'Xavier', 'Josh', 'Paul', 'Payton', 'Michael', 'Bill', 'George', 'Barack', 'Richard'];
      const lastNames: string[] = ['Harmon', 'Barbosa', 'Hernandez', 'Goldberg', 'Fernandez', 'Trammell', 'Stein', 'Baldridge', 'Johnson', 'Clinton', 'Bush', 'Obama', 'Simmons'];
      const emailDomains: string[] = ['gmail.com', 'hotmail.com', 'live.com', 'aol.com', 'tamu.edu', 'yahoo.com'];
      const emailAddresses: string[] = ['monkey', 'lion', 'sponge', 'star', 'squirrel', 'snake', 'donkey', 'banana', 'cake', 'bluebell', 'chocolate', 'coco', 'twizzler', 'snickers', 'lava', 'peanut', 'clam', 'frycook'];

      const items: LeaderboardItem[] = [];
      for(let i = 0; i < numOfValues; i++) {
        const firstNameIndex = Math.floor(Math.random() * (firstNames.length - 0)) + 0;
        const lastNameIndex = Math.floor(Math.random() * (lastNames.length - 0)) + 0;
        const emailDomainIndex = Math.floor(Math.random() * (emailDomains.length - 0)) + 0;
        const emailAddressIndex = Math.floor(Math.random() * (emailAddresses.length - 0)) + 0;
        const points = Math.floor(Math.random() * (100 - 0)) + 0;

        const person = {
          firstName: firstNames[firstNameIndex],
          lastName: lastNames[lastNameIndex],
          email: `${emailAddresses[emailAddressIndex]}@${emailDomains[emailDomainIndex]}`,
          points: points,
          userGuid: "",
        }
        console.log(person);
        items.push(person);
      }
      

      observer.next(items);
      observer.complete();
    })
    return data;
  }

}



export interface LeaderboardItem {
  firstName: string,
  lastName: string,
  email: string,
  userGuid: string,
  points: number,
}