export interface NotificationProperties {
  /**
   * Unique notification identification. Can be used to call a preset.
   */
  id: string;

  /**
   * Title line displayed in the notification component.
   */
  title: string;

  /**
   * Notification message body.
   */
  message: string;

  /**
   * Determines whether the notification requires acknowledgement by the user.
   *
   * If false, it will be prompted every time unless it is a preset call.
   */
  acknowledge?: boolean;

  /**
   * Image URL for the notification icon.
   */
  imgUrl?: string;

  /**
   * Accessible text for the notification icon.
   */
  imgAltText?: string;

  /**
   * DO NOT SET.
   *
   * Value is set by the notification service that determines the start of the notification animation.
   */
  timeGenerated?: number;

  /**
   * Unknown ???
   */
  interval?: number;

  /**
   * Date ranges (unix time) during which notification item is active.
   */
  range?: number[];

  /**
   * Performs an action on notification element click.
   */
  action?: NotificationAction;
}

interface NotificationAction {
  type: string;
  value: string;
}

export interface PlatformNotification {
  /**
   * The notification properties.
   */
  properties: NotificationProperties;

  /**
   * Whether the notification was explicitly acknowledged by the user clicking "Don't show again"
   * or just dismissed/timed out.
   */
  acknowledged: boolean;
}
