export class FieldEnumerator<T> {
  private _obj: T;

  public get(): T {
    return this._obj;
  }

  constructor(obj: T) {
    if (obj instanceof FieldEnumerator) {
      this._obj = obj.get();
    } else {
      this._obj = obj;
    }
  }

  /**
   * `T` is unconstrained, so `Object.entries` and index access on `_obj` do not typecheck
   * under strict settings. Cast at the point of use rather than constraining `T` to an
   * object type, which would be a public API change for every caller of this class.
   */
  public filter(type: 'include' | 'exclude', fields: string[]): FieldEnumerator<T> {
    const filtered = Object.fromEntries(
      Object.entries(this._obj as Record<string, unknown>).filter(([key]) => {
        const fss = fields;

        if (type === 'include') {
          return fss.includes(key);
        } else {
          return !fss.includes(key);
        }
      })
    );

    this._obj = filtered as T;
    return this;
  }

  /**
   * Order the fields in the object as specified. If the property does not exist in the object, it will be
   * ordered at the end of the list.
   */
  public order(fields: string[]): Array<EnumeratorKeyValuePair> {
    const asArray = this.toArray();

    if (fields.length === 0) {
      return asArray;
    }

    return asArray.sort((a, b) => {
      const aIndex = fields.indexOf(a.key);
      const bIndex = fields.indexOf(b.key);

      if (aIndex === -1 && bIndex === -1) {
        return 0;
      } else if (aIndex === -1) {
        return 1;
      } else if (bIndex === -1) {
        return -1;
      } else {
        return aIndex - bIndex;
      }
    });
  }

  public toArray(): Array<EnumeratorKeyValuePair> {
    return Object.keys(this._obj as Record<string, unknown>).map((k: string) => {
      return {
        key: k,
        value: (this._obj as Record<string, unknown>)[k]
      };
    });
  }
}

export interface EnumeratorKeyValuePair {
  key: string;
  value: unknown;
}

export type EnumeratorKeyValuePairs = EnumeratorKeyValuePair[];
