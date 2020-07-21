# TODO (open)

- [] Sanitize all inputs
  - Trim proceeding / trailing whitespace
- [] Prevent changing password more than once in 24 hours
- [] Use EJS layouts e.g. `<%- include('footer'); -%>`
- [] Change default keystore

# TODO (closed)

- Reimplement the LoginManager that logged login attempts and stuff
- Add in the secret question selection stuff for registration
  - Create a SQ module / controller / provider
  - When loading the reg view, show list of secret questions
  - Secret question selections saved when inserting new user
- When user is inserted, "send" email verification
- Is 2FA complete?
- Reimplement the email verification stuff
- Reimplement the password reset stuff
- Have some sort of password strength testing to enforce strong passwords
  - Length greater than or equal to 8
    -\S{8,}
  - Must contain one or more uppercase -[A-Z]{1,}
  - Must contain one or more lowercase -[a-z]{1,}
  - Must contain one or more numeric value
    -\d{1,}
  - Must contain one or more special characters -[!@#$%^&*]{1,}
    - Prevent whitespace?
  - Make a custom Error class and use that inside of the UserValidation middleware to keep track of what
    error message we'll print out inside of the ejs view
- Maybe keep track of previous passwords and prevent someone from using a past password

# Bugs and things to look into (open)

# Bugs and things to look into (closed)

- When you try to register an email that is already registered
- Are password and password confirm fields in REGISTRATION view actually working?
- When entering in a new password, it should have the "Confirm password" field like on registration
- Should probably save all secret question responses as lower case
- The secret question guid saved upon registration is not right
  - When trying to reset the password it presents the wrong questions
