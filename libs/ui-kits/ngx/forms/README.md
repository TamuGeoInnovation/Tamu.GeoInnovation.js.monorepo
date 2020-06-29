# ui-kits-ngx-forms

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test ui-kits-ngx-forms` to execute the unit tests.

## UI Elements

### Radio group

**Usage**:

```html
<tamu-gisc-radio-group
  formControlName="controlName"
  [options]="availabilityOptions"
  displayPath="label"
  valuePath="value"
></tamu-gisc-radio-group>
```

`options`: An array of objects that will be used to populate the labels and value bindings.

For example:

```js
[
  {
    value: true,
    label: 'Yes'
  },
  {
    value: false,
    label: 'No'
  }
];
```

`displayPath`: `options` object path that represents the property to be used as the radio label. Dot notation is supported. From the object above, this will map to "Yes" and "No".

`valuePath`: `options` object path that represents the property to be used as the value binding. Dot notation is supported. From the object above, this will map to `true` and `false`.
