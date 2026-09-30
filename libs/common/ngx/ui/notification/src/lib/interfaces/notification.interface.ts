/** Relative urgency of a notification. `normal` when unset. */
export type NotificationPriority = 'high' | 'normal';

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
   * How urgent this notification is relative to others showing at the same time.
   *
   * `high` sorts above `normal`, which is the default. Within a priority, the order notifications
   * arrived in is kept, so two ordinary notifications behave exactly as they did before.
   *
   * Only meaningful where several can show at once - a grouped container. On its own a notification
   * is neither first nor last.
   */
  priority?: NotificationPriority;

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
