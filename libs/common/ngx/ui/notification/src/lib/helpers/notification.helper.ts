import { NotificationProperties } from '../interfaces/notification.interface';

export class Notification {
  public id: NotificationProperties['id'];
  public title: NotificationProperties['title'];
  public message: NotificationProperties['message'];
  public timeGenerated: NotificationProperties['timeGenerated'];
  public imgUrl: NotificationProperties['imgUrl'];
  public imgAltText: NotificationProperties['imgAltText'];
  public interval: NotificationProperties['interval'];
  public range: NotificationProperties['range'];
  public acknowledge: NotificationProperties['acknowledge'];
  public action: NotificationProperties['action'];

  constructor(properties: NotificationProperties) {
    this.id = properties.id || '';
    this.title = properties.title || '';
    this.message = properties.message || '';
    this.timeGenerated = properties.timeGenerated || Date.now();
    this.imgUrl = properties.imgUrl || '';
    this.imgAltText = properties.imgAltText || '';
    this.interval = properties.interval || 0;
    this.range = properties.range || [0, 0];
    this.acknowledge = properties.acknowledge || false;
    this.action = properties.action || undefined;
  }
}
