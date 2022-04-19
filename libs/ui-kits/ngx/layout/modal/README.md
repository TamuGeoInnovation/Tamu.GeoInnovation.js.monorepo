# TAMU GISC Modals

This library contains components and services that enable rendering components inside of modal card-style windows.

## Library Scope

`@tamu-gisc/ui-kits/ngx/layout/modal`

### Services

- ModalService
- ModalRefService

### Tokens

- MODAL_DATA

## View Containers

This library depends on a `ViewContainerRef` instance to render the modal window and the desired components. This view container can be provided each time the modal is opened:

```js
constructor(private readonly modal: ModalService){}

this.modal.open(FirstLaunchModalComponent, {
  viewRef: this.viewRef
});
```

Alternatively, a global view container can be registered and eliminate the need to provide a view container on each modal open call. Any view container can be provided, but it is **_recommended_** to provide the root-most view container (typically `app.component.ts`) to ensure that modals, including the background overlay, take up the entire viewport.

To register a global view container:

`app.component.ts`:

```js
export class AppComponent implements OnInit {

  constructor(
    private readonly viewRef: ViewContainerRef,
    private readonly ms: ModalService
  ) {}

  public ngOnInit(): void {
    this.ms.registerGlobalViewRef(this.viewRef);
  }
}
```

## Opening a Modal

In the component that is responsible for triggering a modal, inject the modal service, and call the `open` method, providing the a component token.

```js

constructor(private readonly modal: ModalService){}

public openModal(){
  this.modal.open(GreetingsModalComponent);
}
```

## Passing in Data to a Modal

You can pass in data to the provided component by including any valid object in the `open` call, through the optional `ModalOpenOptions`.

```js
constructor(private readonly modal: ModalService){}

public openModal(){
  this.modal.open(GreetingsModalComponent, {
    data: {
      message: 'Hello world!'
    }
  });
}
```

The passed in data can be accessed in the downstream component through the `MODAL_DATA` injection token.

In `GreetingsModalComponent`:

```js
  constructor(@Inject(MODAL_DATA) public readonly data: { message: string }){}

  public ngOnInit(): void {
    console.log(JSON.stringify(this.data)); // '{"message":"Hello world!"}'
  }
```

## Closing the Modal

The host modal component handles closing the modal UI by the user:

- Clicking on the corner 'x'
- Pressing `ESC` on their keyboard
- Clicking on the background overlay

These user events will trigger a dialog cancel event which will immediately dispose of all components in the parent modal view container.

The `ModalRefService` is designed a bridge between the hosting modal component and the instanced component (provided in the `open` call) and enables closing the modal from the instanced component.

In `GreetingsModalComponent`:

```js
  constructor(private readonly modalRef: ModalRefService){}

  public closeModal(){
    this.modalRef.close();
  }
```

Calling the `close` method on the `ModalRefService` without any inputs will be treated the same as one of the three user events described above.

You can provide any value into the `close` call and it will be passed back to the original modal caller. This is useful if your workflow requires some value or result from the modal.

## Accessing Close Modal Data

As explained in the previous section, to send data back to the caller:

In `GreetingsModalComponent`:

```js
  constructor(private readonly modalRef: ModalRefService){}

  public closeModal(){
    this.modalRef.close({
      greetingsAcknowledged: true
    });
  }
```

In the caller component, simply make a subscription to the original `open` call and data provided in the modal close will become available:

```js
constructor(private readonly modal: ModalService){}

public openModal(){
  this.modal.open<{greetingsAcknowledged: boolean}>(GreetingsModalComponent, {
    data: {
      message: 'Hello world!'
    }
  })
  .subscribe((result) => P{
    console.log('User acknowledged greeting message: ', result.greetingsAcknowledged); // 'User acknowledged greeting message: true'
  });
}
```
