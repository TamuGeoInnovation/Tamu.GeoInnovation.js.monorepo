
# TAMU GISC Ngx Toast Notifications

This library allows developers to quickly invoke toast-style notifications prompts with a couple display strategies such as on-demand, time-restricted, and recurring.

### Library Scope

`@tamu-gisc/common/ngx/ui/notification`

### Modules

- NotificationModule

### Services

- NotificationService

### Components

- NotificationContainerComponent

### Interfaces

- NotificationProperties
- NotificationAction

# Setup

## App environment

This library leverages the global `EnvironmentService`, allowing developers to define a set of commonly used or persistent notification events as presets. As a result, each application that imports the `NotificationModule` is **required** to export `NotificationEvents` with a value of an array of `NotificationProperties` from the root `environment.ts`.

In app `environment.ts`:

```js
export const NotificationEvents = []; // Can be an empty array if no presets are being registered.
```

## App Module Configuration

The contents from the aforementioned environment config need to be provided to the `EnvironmentService` in the root app module.

In root `app.module.ts`:

```js
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store'; // Used to persist notification event presets

import * as environment from '../environments/environment';

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, EnvironmentModule, LocalStoreModule, NotificationModule],
  declarations: [AppComponent],
  providers: [
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## App Component

In the root `app.component.html`, provide the global notification container:

```html
<tamu-gisc-notification-container></tamu-gisc-notification-container>
```

When the notification service receives a request to open a notification, it will be appended to the notification container.

# Invoking Notifications

Once the application is configured, notifications can be summoned from any component that injects the `NotificationService` by calling either the `toast()` or `preset()` method.

### toast(notification_properties)

This methods enables the creation of tailored notification events at the component level by providing the appropriate notification properties.

In `example.component.ts`:

```js
export class ExampleComponent implements OnInit {

  constructor(private ns: NotificationService) {}

  public ngOnInit(): void {
    this.ns.toast({
      id: 'example-toast',
      title: 'Example Toast Title',
      message: 'This is an example toast message',
    });
  }
}
```

### preset(preset_id)

This method permits calling a toast from the preset notification events registered against the `EnvironmentService` from the app `environment.ts`. The provided `id` must be a valid preset notification event id. The properties of a preset CANNOT be modified.

In `example.component.ts`:

```js
export class ExampleComponent implements OnInit {

  constructor(private ns: NotificationService) {}

  public ngOnInit(): void {
    this.ns.toast('example-toast');
  }
}
```

# Interfaces

## NotificationProperties

| Property      | Type               | Description                                                                                                                                                                                             |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id` \*       | string             | Unique notification id. This ID is used for diffing persisting notification presets and acknowledgement state.                                                                                          |
| `title` \*    | string             | Notification title displayed above the body message                                                                                                                                                     |
| `message` \*  | string             | Main notification text body                                                                                                                                                                             |
| `acknowledge` | boolean            | Initial acknowledgement state. Notifications with a `false` acknowledgement state will only ever display once. Useful for presets that should immediately and automatically prompt on application load. |
| `imgUrl`      | string             | When provided, will load and display the image left of the title and message body column.                                                                                                               |
| `imgAltText`  | string             | Alternate text applied to image element for accessibility purposes.                                                                                                                                     |
| `range`       | [number, number]   | An array of two unix timestamps (start and end). When provided, the notification will ONLY display when system time is between the provided ranges.                                                     |
| `action`      | NotificationAction | Object representing an internal app routing event. If provided, the application will route to the action value.                                                                                         |

_\* denotes required properties_


## NotificationAction

|   Property | Type | Description  |
|---|---|---|
| `action` | string | Only action `route` is valid at the moment |
| `value` | string | The internal application route that will be navigated to when the notification is clicked on  |


