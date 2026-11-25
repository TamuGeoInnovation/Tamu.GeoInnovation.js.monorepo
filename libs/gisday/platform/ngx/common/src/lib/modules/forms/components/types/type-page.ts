import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** A record that is nothing but a named type: an RSVP type, a submission type (#3328). */
export interface TypeRecord {
  guid?: string;
  type?: string;
  updated?: Date | string;
}

/** What the type pages need of a type's service: its records, and saving and deleting one. */
export interface TypeService {
  getEntities(): Observable<Array<Partial<TypeRecord>>>;
  getEntity(guid: string): Observable<Partial<TypeRecord>>;
  createEntity(entity: Partial<TypeRecord>): Observable<unknown>;
  updateEntity(guid: string, entity: Partial<TypeRecord>): Observable<unknown>;
  deleteEntity(guid: string): Observable<unknown>;
}

/**
 * Which type a set of type pages is for (#3328): one set of list, add and edit pages, and one form, serves every kind
 * of type, and each route says which by providing this. The RSVP type and submission type pages were two copies,
 * identical but for one placeholder, on base classes no other admin page used.
 */
export interface TypePage {
  /** The type in a sentence and in a title: "RSVP type", "RSVP Type". */
  noun: string;
  title: string;
  /** The list's title, such as "RSVP Types". */
  listTitle: string;
  /** The type's field, as its pages have always labelled it: "Type", "Submission Type". */
  field: string;
  /** The list's address, which Save, Create and Delete go back to. */
  list: string;
  service: TypeService;
}

export const TYPE_PAGE = new InjectionToken<TypePage>('TYPE_PAGE');
