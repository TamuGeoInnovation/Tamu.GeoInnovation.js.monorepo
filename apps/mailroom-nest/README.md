# mailroom-nest

App that can handle sending plain emails and emails with attachments via simple POST request. By using **mailroom-nest** individual apps won't need to worry about implementing email sending functionality themselves, enabling individual apps to focus on their own objective.

## Kinds of emails

- Email from a customer to a team member (Kissing bug, geoservices, etc)
- Email from a service to a customer (IdP password reset, verification links, news letter)

## POST request

The structure you should be sending the POST request should mimic that of the `IMailroomEmailOutbound` found here:

```
export interface IMailroomEmailOutbound {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Express.Multer.File[];
}
```

This structure is used by the internal `NodeMailer` lib.

To send an email without any attachments, use a standard POST request to the root route:

```
{
    "to": "atharmon@tamu.edu",
    "from": "giscadmin@gsvcs.tamu.edu",
    "subject": "Test of Mailroom",
    "text": "This is a test of the Mailroom app",
    (optional)"html": "<html><h1>Hello</h1><p>Blah blah</p></html>"
}
```

To send an email _with_ attachments, use a POST multipart/form-data request to the `/attachments` route:

```
{
    "to": "atharmon@tamu.edu",
    "from": "giscadmin@gsvcs.tamu.edu",
    "subject": "Test of Mailroom",
    "text": "This is a test of the Mailroom app",
    "file1": Any file here,
    "file2": Any file here,
    "fileN": ....
}
```

The file attachments can be named anything, all file based parameters supplied in the request will end up in an array handled by NestJS. The `attachments` property of `IMailroomEmailOutbound` is for internal use and not something used by NodeMailer.

If you define the optional `html` property do note that it will override the contents of the email as defined by the `text` property i.e. when `html` is defined then that is the contents of the email and not the `text` property.

## Delivery Status

Each email request received by **mailroom-nest** that doesn't throw an error will be saved in the `emails` table. The `MailroomEmail` entity has a property `deliveryStatus` which is of enum `EmailStatus` described below.

| Enum     | Value | Meaning                                            |
| :------- | :---: | :------------------------------------------------- |
| Accepted |   1   | The email was been accepted by the TAMU SMTP relay |
| Rejected |   2   | The email has been rejected by the relay           |
