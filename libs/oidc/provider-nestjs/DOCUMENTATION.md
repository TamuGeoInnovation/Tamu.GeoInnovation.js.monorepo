# accounts.geoinnovation.tamu.edu

Below you will find basic documentation for our OpenID Connect enabled OAuth Identity Provider microservice. I like to call it the Cookie Dispenser.

>

# Basic features

This server handles account / user management functions so that our other websites don't need to. In this microservice I make the distinction between both **user** and **account**. **User** represents those components used during the login and verification process of a physical user such as their stored password hash and salt, a boolean indicating if they have two-factor authentication enabled and if so their 2FA secret. **Account** is used to refer to the physical user's own information such as email address, name, surname, gender, birthday, locale, address, signup IP address, etc. Generally when I refer to Account I am refereing not only to those things that are related to a person's identity as described above, but when I use Account in relation to code it means a "join" has been performed to add all that person's User info with their Account info. Think User + Account = Account.

> Below are a few of the basic features of the Cookie Dispenser:

- User login
- Account roles per site
- Two-factor authentication with Google Authenticator
- Password reset
  >

# Running the server

To run the server you need to have TypeScript installed; the best way to do that is with NodeJS Package Manager (or **npm**). Run the following command with **npm** installed:

> `npm install -g typescript`
>
> Now you can clone the project from GitHub if you haven't done so already. Once cloned you will need to download all the **npm** projects listed within the project's package.json file. This lists all required third-party projects our server depends on. You can use `npm install` inside the root of the project to automatically download all required projects. With that done, you'll need to open a terminal and use the TypeScript compiler to compile the TypeScript into JavaScript; use the following command to make your life much simpler:
>
> `tsc -w`
>
> This will have TypeScript monitor your files for any changes and automatically recompile the TypeScript into JavaScript without you having to use the `tsc` command all the time.
>
> If using Visual Studio Code you can use the Debug menu to both launch the microservice and debug it. All you need to do is go to the Debug menu and select the `Start server.ts` option near the top and press the green play button or press F5. Once launched the server automatically uses port 4001 but this can be easily changed inside the **server.ts** file. Since this server handles things mostly in a backchannel (server to server) there is nothing really to see at http://localhost:4001.

# node-oidc-provider

The heart of this project is **[node-oidc-provider](https://github.com/panva/node-oidc-provider)**, a barebones OIDC implementation for NodeJS. And when I say barebones I mean barebones; you will not get much help from the project maintainer or his documentation unless you know the [OIDC specification](https://openid.net/specs/openid-connect-core-1_0.html) cover to cover.

>

# Routes

A lot of what this server does is handled using ExpressJS routes (think endpoints). Two of the main base-routes used are highlighted and detailed below.

>

## Interaction

All interaction routes are primarily used during the login process.

>

### GET /interaction/:grant

This is the first route used by a oidc-client site when performing a user login. The query parameter **grant** is the id of the session generated by the oidc-provider to reference this particular login. At this point there should be a record in the **sessions** table that matches this grant id. This route renders to the user a simple login form with email and password inputs. Upon pressing submit, the server sends these inputs via POST to /interaction/:grant which is a separate route (within Express you can have two routes with the same address but different methods).

>

### POST /interaction/:grant

At this point we check to see if the submitted user email and password matches any stored user info in our database. If we find a record that matches this email and password hash combination we log the login in the **user_logins** table. After logging the login we then check to see if this user has already verified their email address. If not we will render a view that will generate and send the email with the verification link in the body of the email. If the user's email was verified we then check to see if they have 2FA enabled: if so we display a 2FA verification view where the user provides their 2FA token, and if not, we call the oidc-provider function **provider.interactionFinished()** which generates the authorization code and sends it to the client site.

> If no record of this user is found OR if the password hash does not match the one stored, we return a general error to the user. It goes against security best practices to inform the user of an incorrect email or password so we only say "The email and password combination does not exist" or something to that effect. We do not want to disclose the existence of emails in our database to the public.

### POST /interaction/:grant/2fa

When a user enables 2FA for their account, we do two things for this user inside the **users** table: firstly we set the field **enabled2fa** to true for this user, and secondly we generate a secret token which is stored in the **secret2fa** field.

> If the user has 2FA enabled and they try to login, they must now enter the 6 digit token generated by Google Authenticator. This is handled mostly by the third-party library **otplib**. We first grab all user information from the **users** table. Once we have the user we check to see if the token they've provided is valid. This check is done by the **TwoFactorAuthUtils.isValid()** helper function. This does a few things such as checking the length of the token as well as communicating with **otplib** to see if the token is valid. This function requires both the token the user has provided as well as the secret token we stored for the user when they enabled 2FA.
>
> If the token they provided is valid we call the **provider.interactionFinished()** function to generate the authorization code and end the login process. If the token they provided is incorrect such as not exactly 6 digits or incorrect we display an error message asking them to try again. As of 4/5/2019 there is no limit to how many times you can try a 2FA code.

### POST /interaction/:grant/confirm

Default route called by **oidc-provider** which is called whenever the user is already signed into the Identity Provider (Cookie Dispenser) and is logging into a specific client site. This will display a view which asks the user if they authorize this particular client site to access their user info with the Identity Provider.

>

### POST /interaction/:grant/login

Default route used by **oidc-provider** to facilitate user login. Doesn't check to see if the user has input any valid credentials. This needs to be removed but further testing to makes sure it isn't used by anything else needs to be done as of 4/5/2019.

### GET /logout

Currently not used. This is my own implementation of the OIDC specification detailing logout. It does not work right as of 4/5/2019.

### provider.use()

This middleware function is used to delay the expiration of a user's access token if they've been active on the site. Each site will have a middleware function which validates the user's access token with the Cookie Dispenser before allowing the user to access some data such as an API endpoint. Everytime that token validation middleware is called on a client site this **provider.use()** function will search for the access token in table and update the **expiresAt** field. This will prevent active users from being logged out after the initial **expiresAt** value is reached.

>

## Accounts

All accounts routes are primarily used to register accounts, fetch account information, reset an account's password, enable / disable 2FA, etc.

>

### GET /accounts

Used by the Cookie Dispenser's Angular front-end to get a list of all accounts in the database. Simply returns a JSON list of accounts found in the table **accounts**.

>

### GET /accounts/:sub

This route is used to return a specific account from the **accounts** table.

>

### POST /accounts/update/:sub

This route is used by the Angular front-end to change some of the basic information relating to the account holder such as name, surname, email, etc.

>

### POST /accounts/register

We use this route to register a new account with the Identity Provider. The registration process is a series of database queries managed by the AccountManager class described in the next section.

>

1. The part of the registration process inserts the user's information into the **accounts** table.
2. We then add the user specific (user being related to the login process) information into the **users** table.
3. After the account was added we send an email to the email provided in the registration form. The user must follow a link provided in this email to verifiy their account thereby giving the account access to our services.
4. \*We then add client site specific information depending on the site they're registering for. At the moment this would be TAMU specific information such as the person's UIN, department, field of study, etc.
5. We now set the account roles for the site they registered for. We may change this in the future to give all account holders basic user level access to all accounts but that will require further discussion as of 4/5/2019.
6. The last step of the registration process is to store the account's password reset information such as the secret question id and a hash of the user's response for comparision later on. All this information gets stored in a table named **secret_questions**.
   >

### GET /accounts/register/:id

This route is used to set the account holder's emailVerified field to true. This particular route is used by the registration process email that is sent to a new account holder's email address. They click on a link in the email which takes them to this end point. The query parameter **id** is the user's own sub (user guid).

>

### POST /accounts/register/sendVerification

This route is responsible for sending a new email to the account holder's email address so that they may verify their email if they never received the first or if they deleted it. This is used primarily in the login process if a user tries to login but has not yet verified their email address.

>

### GET /accounts_sqs

This poorly named route is due to ExpressJS treating /accounts/sqs as a call to /accounts/:id. Here we return all secret questions stored inside the **secret_questions** table in the database.

>

### GET /accounts/:sub/sqs

This also poorly named route is due to ExpressJS. Here we search the **secret_answers** and **secret_questions** tables for the account's own and return those questions and answer hashes. Used by the password reset function.

>

### GET /pwr/:token

This route is used by the password reset function and is provided to the user in the password reset request email sent to their email address. This will use the query parameter **token** to search the table **user_pw_resets** for any records that match this token and that is still valid (meaning the expiresAt time hasn't already happened). If the **token** is still valid we then grab the account's information. In the future it would be good to do some IP sleuth work here but we need either a different IP API that lets you do batch requests for free or pay for an IPStack account. We then see if the account holder enabled 2FA, if so we need to display a view that lets the user input a 2FA token. If the user does not have 2FA enabled we then load up the account's secret questions and answers and display a view with the secret questions. The user can then input their answers and send them off to POST /pwr/:token.

> If the token in the link found in that password reset email is no longer valid (the expiresAt time has already occured) then we display to the user a message saying the link they tried is no longer active and for them to start the password reset process over again.

### POST /pwr/:token/2fa

This route is used whenever someone with 2FA enabled is trying to reset a password and has input their token from Google Authenticator. It will first check to see if the **token** is still valid by checking in the **user_pw_resets** table. If so it will then check to see if the 2FA token provided is valid. Again we have to compare the 2FA token to the secret we stored inside the **users** table. If either the 2FA token or the reset token is no longer valid we display an error messsage. Assuming the user's 2FA token is valid and the reset token hasn't expired we then grab the account holder's secret questions and display that in a view.

>

### POST /pwr/:token

This route is used to compare the hash of the provided secret question answer to those hashes stored back when the user registered. If the hash of each answer provided to us matches those stored in the database we then render a new view that will prompt the user to input the new password they would like. At the moment nothing happens if either provided answer does not compare to the hashes we have stored as of 4/5/2019.

>

### POST /npw/:id

This route is where we actually reset the user's stored password by hashing the inputed password and storing this new hash under the account holder's user. The outline of what this route does is below:

>

1. In the first step we check the **user_pw_resets** table to see if the token provided in the query parameter id is an actual password reset attempt.
2. Once found, we then proceed to update the password by calling AccountManager.updateUserPassword()
3. If the password update works without issue we remove the record with this token in the **user_pw_resets** table.
4. Once everything is updated and the record is removed we then send an email to the account holder's email address informing them of the password reset.
   >

### GET /accounts/2fa/enable/:sub

We use this route to enable two-factor authentication for a particular account. Upon setting the **enabled2fa** field inside the **users** table to true, we then will generate a new two-factor authorization secret to be stored alongside the user information. With the generated secret at hand, we then create a QR code image that is displayed to the account holder. He or she can then scan this QR code with their Google Authenticator app to add the account / Cookie Dispenser to their app. Whenever the user needs to login they will need the code generated here to login.

>

### GET /accounts/2fa/disable/:sub

This route will disable 2FA authentication using the account holder's sub (user guid). This effectively sets the **enabled2fa** field for the user in the **users** table to false and then sets the **secret2fa** field to NULL.

>

# Managers

Managers act as a communication layer between the routes highlighted above and our database.

>

## DbManager

## AccountManager

The main manager in our Identity Provider is the **AccountManager** which handles the majority of account level database interactions.

>

### SALT_ROUNDS

This property of the **AccountManager** class is used by our salting and hashing library bcrypt. It determines how many iterations of processing the module will use to hash the value with the forumula `2 ^ rounds`. More can be found [here](https://github.com/kelektiv/node.bcrypt.js/#a-note-on-rounds).

>

### ensureDbIsSynced()

This function is used to ensure the current database tables / relationships are up-to-date. I generally like to call this inside each **AccountManager** function after creating relationships. Note that joins / relationships / associations are all the same idea when it comes to SequelizeJS.

>

### getAccountClaims(id: string)

** MAY NOT BE USED ANYMORE IN THIS ITTERATION OF OUR IDP - AARON 04/04/2019 **

> This function looks for a particular account inside the **accounts** table. Once found, it will return a Promise with that account as the return object.

### getAccount(id: string)

This function looks for a particular account inside the **accounts** table. Once found, it will return a Promise with that account as the return object. If no record for a particular sub (user guid) is found, it will resolve with false.

>

### getAccountTAMU(id: string)

This function will create an association between the **accounts** table and the **accounts_tamus** table. It will then find a particular record much like **getAccount()** then use that account's **sub** field to find a corresponding value inside **accounts_tamus**. Once found, it will return a Promise with both the values found in the **accounts** and **accounts_tamus** tables. If no record is found it will return a Promise with false as the return object.

> SequelizeJS created the table **accounts_tamus** when I specifically told it to use **accounts_tamu** without the extra "s". I do not know why it decided to add that extra "s" nor do I know how to address this at this time as it seems rather minor, albeit annoying.

### isAccountEmailVerified(sub: string)

This function will search for a particular account in **accounts** and return the value of that account's **emailVerified** field.

>

### getAccountAccess(id: string)

This function performs a three-way association between **accounts**, **access_control_roles**, and **access_control_user_roles**. We then return to the caller all information associated with that account along with which site's this account has access to and to what capacity (user, manager level access, administrator) as a Promise.

>

### getAllAccounts()

This function simply returns all accounts found inside the **accounts** table as a Promise.

>

### updateAccount(account: IAccountAttrs)

This function will take a new account object (IAccountAttrs) as input and update an account record inside the **accounts** table. Useful for updating an account holder's personal information.

>

### registerAccount(account: IAccountAttrs, siteGuid: string)

This function is used to register a new account with a particular site. At the moment it will first search for an existing TAMU account (this should probably be changed to a normal account) with the given **account.sub** value passed in. If we find an account, we simply add a new record inside **access_control_user_roles** table with a default user level access. If no account is found with this **account.sub** then we add this information as a new record inside **accounts**.

>

### verifiyUserEmail(sub: string)

This function takes in an account's sub and will set the **emailVerified** field to true for said sub inside the **accounts** table. This function returns a Promise of true if an account was updated; Promise of false if no sub was updated / found.

>

### registerTAMUAccount(account: ITAMUAttrs)

This function will insert an account's TAMU specific information if it exists. It will return a Promise of true if it successfully inserted the record and a Promise of false if it was not able to do so.

>

### registerUser(user: IUsersAttrs)

This function will insert a new user into the **users** table. Remember that we differentiate account, which is all the stuff ABOUT a particular person such as name, birthday, gender, etc, while a user is that information used during the login process such as their password hash and two-factor authentication secret.

> We start by searching the **users** table for an email that matches the one defined inside our **user** parameter. If no user is found with such an email, we proceed with inserting the user. We also will salt and hash the user's password before storing using bcrypt. This way no plain text passwords are ever stored in our database.

### updateUserPassword(sub: string, newPassword: string)

This function will effectively reset the password of a user. It will try to find an existing user inside table **users**. If it finds one, it will salt and hash the **newPassword** parameter and update the existing user's password with this **newPassword** hash.

>

### getRoleByUserGuid(id: string)

This function is used to find which sites a particular account has access to and what their role is. This function will return a Promise with a simple object containing two properties: role and level.

>

### getUsersRoleBySite(userGuid: string, clientId: string)

This function will create a three-way assocation between **access_control_roles**, **access_control_user_roles**, and **sites**. It will then return the access role and level that a particular account has with a particular site.

>

### createNewRole(level: number, name: string)

This function is used to add new roles into the **roles** table. This isn't used very often.

>

### addUserRole(siteGuid: string, roleId: number, userGuid: string)

This function will add a new record into the **access_control_user_roles** table. Used to register an account with a new site.

>

### findUserEmail(email: string)

This function will return the existance of an existing user in the **users** table. Will return a Promise of true if found, while it will return a Promise of false if no email matched the one given.

>

### findUser(email: string, pw: string)

This function is used to perform the "login". It will search **users** for an email matching the **email** passed in. If found, we then use the bcrypt.compare() function to compare the existing user's hashed password with the plain text password the login attempt used. bcrypt will then determine if the password used, once hashed, is equal to the one stored. If so, we return a Promse with the user's information back to the caller.

>

### getUser(sub: string)

Much like findUserEmail(), this function will return a user by their **sub** rather than by their email address.

>

### updateAccountLastIPAddress(sub: string, lastUsedIP: string)

This function will update an account's **last_used_ip_address** with the IP address of their last successful login.

>

### getAllSecretQuestions()

This function will return a Promise containing all secret questions contained inside the **secret_questions** table.

>

### getSecretQuestionsByUserSub(userSub: string)

This function creates an assocation between tables **secret_questions** and **secret_answers**. It will then search **secret_answers** for any records that belong to a particular account. It then returns those values inside a Promise. This is used to find out which secret questions an account holder chose to use when registering.

>

### insertSecretAnswer(userSub: string, questionId: string, questionAnswer: string)

This function is used to insert a record into **secret_answers**. Before inserting a new record, we use bcrypt to salt and hash the account holder's answers, this way we do not keep their answers in plain text.

>

### insertNewPWResetRequest(sub: string, token: string, ipOfInitializer: string)

This function is used to create a record of a password reset request. This also manages the life of password reset links used in our password reset emails.

>

### isResetLinkStillValid(token: string)

This function will search the **user_pw_resets** table for a token that matches the **token** parameter. If found, it will return a Promise of true if the token's **expiresAt** time has not yet transpired and will return a Promise of false if that time has already occured.

>

### compareSecretAnswers(id: string, questionId: string, answer: string)

This function is used to insert a new secret answer into the **secret_answers** table. It will first make sure the password reset token is still valid. If so, it will then look in **secret_answers** for a user's secret answer hash. It then uses bcrypt to compare the answer given with the answer stored. If the two hashes match, we then return a Promise of true and if they do not match we return a Promise of false.

>

### getPWResetRecord(id: string)

This function simply returns a record detailing the password reset request found inside **user_pw_resets**.

>

### deletePWResetToken(id: string)

This function is used to remove the record associated with a particular password reset request after the user has successfully reset or changed their password. This is to prevent the password reset link from staying active after a password reset has occured.

>

### enable2FA(sub: string)

This function will set the **enabled2fa** field for a particular user to true and generate and store a new **secret2fa** secret for use with two-factor authentication. It will try to find a user matching this sub inside **users**. If found and **enabled2fa** is false, it will then set the value to true and insert a newly generated two-factor authentication secret. We need to store the secret as each secret is supposed to be different for each user. We MAY want to look into hashing this secret.

>

### disable2FA(sub: string)

This function is used to disable a users two-factor authentication. It will set **enabled2fa** to false and set the **secret2fa** field to NULL.

>

# GISCEmailer

>

# Important third-party libraries

Below is a list of some of the more important third-party libraries used in the development of this server.

>

- [Express](https://github.com/expressjs/express)
- [passport](https://github.com/jaredhanson/passport)
- [oidc-provider](https://github.com/panva/node-oidc-provider)
- [nodemailer](https://github.com/nodemailer/nodemailer)
- [otplib](https://github.com/yeojz/otplib)
- [sequelize](https://github.com/sequelize/sequelize)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js/)
- [bluebird](https://github.com/petkaantonov/bluebird)
- [EJS](https://ejs.co/)
