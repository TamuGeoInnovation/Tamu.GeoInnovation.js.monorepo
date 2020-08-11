# User info
- Registration
  - Added datetime
  - Last edited datetime
  - signupIPAddress
  - lastIPAddress
  - backup email address?

- Secret questions
  - UserGuid
  - QuestonId
  - Answer (bcrypted)
  - Answered datetime 

- Form verification and normalization
  - Need to make sure the following attributes are normalized
    - Gender (male / female)
    - Birthdate (MM-DD-YYYY)
    - Phone number (+XX XXX-XXX-XXXX)
    - Website (http:// or https://)
    - Profile (http:// or https://)
    - zoneinfo (get from IPStack)
    - locale (get from accept-language header)

# Other processes
- Email verification
  - At the moment this does nothing. Upon registration email user at that email and ask them to click on the verification link

- Phone verification
  - At the moment this does nothing. Do we want phone verification? It would be nice to have if we ever implement 2FA with phone instead of Google Authenticator

- Forgotten password email
  - Ask user to input an email they think they used to register and send an email to that address IF it exists. We never let the  user know if we sent it or not. They just have to check the email address provided.
  - We also need to limit the "life" of the password reset URL to about 10 or 15 minutes.

- Log EVERYTHING!
  - We need to log so many things it's insane:
    - Failed login attempts
    - password resets
    - password changes
    - when someone tries to login with incorrect info
    - when someone tries to reset password with incorrect info

# User info verification
- Sign-in page
  - At the moment we let the user know if username or password is incorrect. Don't do this. Only say "The username or password combination is invalid"