# mailroom-nest

App that can handle sending plain emails and emails with attachments via simple POST request. By using **mailroom-nest** individual apps won't need to worry about implementing email sending functionality themselves, enabling individual apps to focus on their own objective.

## Kinds of emails

- Email from a customer to a team member (Kissing bug, geoservices, etc)
- Email from a service to a customer (IdP password reset, verification links, news letter)

## POST request

To send an email without any attachments, use a standard POST request to the root route:

```
{
	"to": "atharmon@tamu.edu",
	"from": "giscadmin@gsvcs.tamu.edu",
    "subject": "Test of Mailroom",
	"text": "This is a test of the Mailroom app"
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

## DEPRECATED OutboundPipe

The `OutboundPipe` is an important piece of the application that will transform the POSTed `body`. The pipe will take a body and kind of morph it into the following type:

```
{
    emailBodyText: string;
    recipientEmail: string;
    subjectLine: string;
}
```

## DEPRECATED HasRecipientInterceptor

This interceptor will look through a request and see if it has those fields required to send an email through the TAMU SMTP relay; if something is missing it will throw an error which is then picked up by the `MailroomExceptionFilter` which will then handle inserting the error message in the database.

## Delivery Status

Each email request received by **mailroom-nest** that doesn't throw an error will be saved in the `emails` table. The `MailroomEmail` entity has a property `deliveryStatus` which is of enum `EmailStatus`. At the moment those values indicate the following: 1 = Accepted, the email has been accepted by the TAMU SMTP relay and should be on its way, and 2 = Rejected, the email was rejected by the relay. I do not think we currently are logging those rejected emails in the `rejects` table as of 6/10/22.

## Error handling

**mailroom-nest** uses an exception filter `MailroomExceptionFilter` to process errors that pop up in the process of sending an email. These errors are then logged in the database under the table `rejects`. Note that `MailroomExceptionFilter` is applied on routes at the moment and not at the controller level; if you forget to `@UseFilters(MailroomExceptionFilter)` then it'll just cause the server to error and not log anything.
