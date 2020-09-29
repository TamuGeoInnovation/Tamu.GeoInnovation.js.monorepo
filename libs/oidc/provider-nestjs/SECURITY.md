# Security issues
The following are just a few points where security may become an issue with the Identity Provider. We should at least try to handle these in a basic manor.
>
# Current things to check
>
1. Make sure /token/introspection is protected by HTTP basic auth at the very least
2. What is the importance of a nonce and should we be using it?
3. How should we go about replacing the default key values found in `oidc-configuration.ts`? What values do we use here?
4. Is there specific encryption algorithms we should be using in the IdP?
5. What happens if the IdP node service is restarted, which tokens are affected, if any at all?
6. Logout request DoS
7. Are we making sure JWT's are valid when requesting resources with the API?
8. Change the client authentication method
9. Change how the RP exchanges the authorisation code for the id token
10. Id token validation
11. Token binding
12. Key rotation
13. CAPTCHA
>
# Information
## 1. /token/introspection
As mentioned [here](https://www.oauth.com/oauth2-servers/token-introspection-endpoint/) and [here](https://tools.ietf.org/html/rfc7662#section-4), the token introspection end point is vulnerable. Attackers can use this end point to "poll the endpoint, fishing for a valid token". They recommend to limit the introspection end point to only those clients that are authenticated. It states "One way to protect the endpoint is to put it on an internal server that is not accessible from the outside world, **or it could be protected with HTTP basic auth**" which we already do... I think. Maybe not. Something to look into.
>
## 6. id_token_hint
From [this](https://openid.net/specs/openid-connect-session-1_0.html#Security): 
"The **id_token_hint** parameter to a logout request can be used to determine which RP initiated the logout request. Logout requests without a valid id_token_hint value are a potential means of denial of service; therefore, OPs may want to require explicit user confirmation before acting upon them." 
>
## 7. JWT validation
Step 5 highlighted in [this article](https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec) says to validate the JWT to make sure it's authentic and hasn't been tampored with before allowing access. Do we do this already?
>
## 8. Client authentication method
We currently use the `client_secret_basic` client authentication method. This sends identifies our RP with the IdP using the **Authorization** header. The **Authorization** header is equal to `client_id + ":" + client_secret`. I think if we were to use `private_key_jwt` instead it would be more secure. This uses "asymmetric keys provided via `keystore`" sent in the request body as `client_assertion`. More info found [here](https://github.com/panva/node-openid-client#client-authentication-explained).
>
## 9. Authorization header vs JWT
In the process of exchanging the authorisation code for an id token we usually use the Authorization header of type Basic with a vlue of the client id and the client secret base64 encoded. We can instead use a JWT for this which provides stronger security. More information can be found [here](https://connect2id.com/learn/openid-connect#example-auth-code-flow-step-2).
>
## 10. Id token validation
When we recieve an id token from /token or /me, we need to be validating the id token we recieve. More information can be found [here](https://connect2id.com/learn/openid-connect#example-auth-code-flow-step-2).
>
## 11. Token binding
An additional layer of protection used to secure OAuth is the use of token binding. This crap went over my head so read up on it [here](https://connect2id.com/learn/token-binding).
>
## 12. Key rotation
It is recommended by panva to rotate out `cookies.keys` at regular intervals. More info [here](https://github.com/panva/node-oidc-provider/blob/master/docs/configuration.md#cookieskeys).
>
## 13. CAPTCHA 
We can use a CAPTCHA "to mitigate against brute force" attacks. We can use this if someone fails to login after 2 or 3 attempts or while trying to reset a password. See the PayPal example [here](https://www.troyhunt.com/everything-you-ever-wanted-to-know/), near the middle of the page, for more details.