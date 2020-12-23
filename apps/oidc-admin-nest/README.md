# SQL Statements

## How many people are 'logged in'?

```sql
SELECT
  COUNT(expiresAt)
FROM [oidc-idp].[dbo].[access_tokens]
WHERE [expiresAt] >= GETDATE()
```

## How many people have an access token for a particular site?

```sql
SELECT
  [id]
  ,[grantId]
  ,[expiresAt]
  ,[consumedAt]
  ,[data]
FROM [oidc-idp].[dbo].[access_tokens]
WHERE [data] LIKE '%oidc-client-test%'
```

## Which client has the most users?

```sql
SELECT
  COUNT(clientId) as num,
  clientId
FROM [oidc-idp].[dbo].[access_tokens]
WHERE clientId IN (SELECT DISTINCT clientId as clientIds FROM [oidc-idp].[dbo].[access_tokens] WHERE clientId IS NOT NULL)
GROUP BY clientId
```

## How many new users in the past 30 days?

```sql
SELECT
  [guid], [email]
FROM [oidc-idp].[dbo].[user]
WHERE added < GETDATE()
AND
added > DATEADD(DAY, -30, GETDATE())
```

## How many logins in the past 30 days?

```sql

SELECT [grantId]
      ,[clientId]
FROM [oidc-idp].[dbo].[access_tokens]
WHERE added < GETDATE()
AND
added > DATEADD(DAY, -30, GETDATE())
```

# OIDC-ADMIN

## Views

### Home

- General stats
  - How many people are logged in? (I guess count the number of valid access tokens)
  - Which client has the most users? (doughnut; each section is by client)
  - How many logins the past month? Line chart (by day)
  - How many new registrations past month? Line chart (by day)
  - Server errors past week (bar chart)
  - Last time the server was restarted

### Sidebar

- Link to the home page
- Link to the User's list
- Link to the Client-metadata list
- Link to the Roles list

### Users view

- Display list of users with full name, email, guid
  - Click on user to go to User view

### User view

- Identification information displayed
- Roles
- Log user out (invalidate access token)
- Edit user information?
- Delete user
- Enable / disable 2FA

## Features

### Admin - General

- Add new client-metadata
- Add new grant-types
- Add new response-types
- Add new token-endpoint-auth-methods
- Add new redirect-uri
- Add new roles
- Add new secret questions

### Admin - User

- Permanently delete user + account + all other information
- Assign a role to a user for a client
- Log a user out? (Invalidate access token)
- Disable / enable 2FA

```

```
