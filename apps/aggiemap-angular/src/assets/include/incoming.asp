<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <title>Aggie Map Feedback - Texas A&amp;M University</title>
    <meta name="description" content="Send us a line, we want to hear your thoughts regarding your Aggie Map experience." />
    <meta name="keywords" content="about, tamu, aggiemap, aggie, map, texas a&m, a&m, tamu campus, texas a&m campus, a&m campus, feedback" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#332c2c">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0" />
    <link rel="icon" type="image/x-icon" href="../favicon.ico" />
    <link href="../styles/main.css" rel="stylesheet" type="text/css" />
    <link href="../styles/1140.css" rel="stylesheet" type="text/css" />
    <link href="../fonts/tungsten/tungsten.css" rel='stylesheet' type='text/css'>
    <link href="../fonts/moriston_pro/moriston_pro.css" rel='stylesheet' type='text/css'>


    <style>
        body,
        html,
        .form {
            height: 100%;
            width: 100%;
            text-align: center;
        }
        
        .form {
            padding-left: 5vw;
            padding-right: 5vw;
            box-sizing: border-box;
        }
        
        #comment-img {
            height: 3rem;
            width: 3rem;
            margin-bottom: .75rem;
            display: block;
            background-image: url(../images/comment.png);
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        }
        
        #alt-return {
            font-size: .8rem;
            color: #9E9E9E;
            font-style: italic;
            font-weight: 300;
            text-decoration: none;
            /*            margin-top: .75rem;*/
        }

    </style>

</head>



<!--
<%
Dim ObjSendMail
Set ObjSendMail = CreateObject("CDO.Message") 
'Dim asdf,bbb,cccMark A. Hussey, Interim President <president@tamu.edu>
'asdf=Request.Form("senderinfo")
abbb=Request("sender_name")
bbb=Request("senderinfo")
ccc=Request("comments")
'senderEmail = Request.Form["From"]
'commentEmail = Request.Form["feedback"]

ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendusing") = 2 'Send the message using the network (SMTP over the network).
ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserver") ="smtp-relay.tamu.edu"
ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserverport") = 25 ' or 587
ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpusessl") = 1
ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpconnectiontimeout") = 60

'ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate") = 0 'basic (clear-text) authentication
'ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendusername") ="aggiemap@tamu.edu" 'your Google apps mailbox address
'ObjSendMail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendpassword") ="" 'Google apps password for that mailbox

ObjSendMail.Configuration.Fields.Update


ObjSendMail.Subject = "Aggiemap Feedback"
ObjSendMail.From = bbb
ObjSendMail.To = "aggiemap@tamu.edu"
ObjSendMail.Cc = "cmatus@tamu.edu;atharmon@tamu.edu;edher@tamu.edu;daniel.goldberg@tamu.edu"
'ObjSendMail.From = ObjSendMail.From & "<br>Sender: " & bbb
'ObjSendMail.SenderName = abbb

ObjSendMail.HTMLBody = "From " & abbb & "<br><hr>" & ccc
'ObjSendMail.TextBody = ccc
ObjSendMail.BodyPart.Charset = "utf-8"

ObjSendMail.Send
Set ObjSendMail = Nothing 
%>
-->



<div class="flex flex-column justify-center align-center form">
    <div id="comment-img"></div>
    <p class="bold">Thank your for your comment!</p>

    <p>You will be redirected back to the Aggie Map in <span id="time" class="bold"></span> seconds. </p>
    <a href="../" id="alt-return">Click here if you are not redirected automatically.</a>
</div>

<script>
    var timer = 7000; // Miliseconds to redirect
    document.getElementById("time").innerHTML = timer / 1000; // Set initial second counter on the view

    setInterval(function() { // Countdown timer
            timer = timer - 1000;
            document.getElementById("time").innerHTML = timer / 1000; // Print new second
            if (timer === 0) { // Once counter hits 0 seconds, redirect to aggiemap
                window.location = "../";
            }
        }, 1000) // Every 1000 miliseconds

</script>
