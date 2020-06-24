# Custom adapter for oidc-provider
The following is the execution order for the built-in memory adapter. When a custom adapter works in this order it seems to function well.
1. Go to localhost:4003/login with the RP and IdP running
2. Adapter.upsert() is called with a new id value
3. Adapter.find() is called and retrieves the id of the new session
4. The browser now prompts us to put in our login credentials. We log in...
5. We are redirected to /interaction/:grant/login
6. Account.authenticate() is called
7. After Account.authenticate() is finished we call this.oidc.interactionFinished() from within /interaction/:grant/login
8. this.oidc.interactionFinished() calls Adapter.find() which finds the session id
9. Adapter.upsert() is called with the session id as the parameter
10. Adapter.find() is called after Adapter.upsert() and returns the session id
11. We are redirected to /auth/:interaction and the session id is retrieved yet again
12. Adapter.destroy() is called providing the session id as the parameter
13. Non-adapter method findById() is called
14. Account.upsert() is called to upsert an authorization code to the table. The grantId column here holds the just destroyed session id value
15. Account.upsert() is called again to upsert a new session into the table.
16. The IP returns the authorization code to the client
17. The client sends the authorization code to the IdP
18. Adapter.find() is called uses the authorization code to look up the value stored in the table
19. Adapter.consume() is called on the authorization code setting the value in the table to the time it was consumed (typically using Date.now())
20. After consumption, findById() is called
21. Adapter.upsert() is called and upserts a new access token into the table; grantId is the original session id
22. Adapter.upsert() is called and upserts a new refresh token into the table; grantId is the original session id
23. findById() is called once again
24. The access token is returned to the client along with a refresh token


# The server
Uses Typescript, NodeJS, ExpressJS, and Sequelize to connect to geodb08.tamu.edu. This serves up data from GISDay. 
>
# Getting started
- You need to have `npm` and `tsc` installed.
- Navigate to root directory of this project and run `npm install`, this will fetch all the packages for the project found inside the file **package.json**.
- Once this is finished go ahead and type `tsc` into the terminal / cmd to compile the Typescript.
- Head to the **Debug** pane in VSCode and debug using the **Start server.ts** option.
- You should see the following at **localhost:4001**:
```
{"success":true}
```
>
# Trying it out
This is an API server and as such only spits out data as JSON; no HTML is involved yet.
>
## Implemented endpoints
- /manholes
  - (GET) /
    - ex. http://localhost:4001/manholes
    - Returns all manholes in the table manholes_submissions
  - (GET) /user/:userGuid
    - ex. http://localhost:4001/manholes/user/f6bc522b-e4a0-4706-976e-adb905306f8d
    - Returns all manholes submitted by userGuid
  - (POST) /
    - ex. http://localhost:4001/manholes
    - Body must contain:
      - UserGuid
      - lat
      - lon
      - accuracy
      - fixTime
    - Uses the Sequelize.create() method to save a new row to the table
