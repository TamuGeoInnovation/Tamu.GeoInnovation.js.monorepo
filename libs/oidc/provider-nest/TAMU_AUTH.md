# Dictionary
## CAS
Central Authentication Service, or CAS, acts as an authentication protocol in a remarkably similar fashion to OAuth. It "allows web applications to authenticate users without gaining access to a user's security credentials such as a password". There are three parts of the CAS protocol: a _client_ web browser, the web _application_ requestiong authentication, and the _CAS server_. "It may also involve a _back-end service_, such as a database server, that does not have its own HTTP interface but communicates with a web application".
>
When a client visits an application that requires authentication, the client is redirected to CAS for validation. Here the CAS will validate the client's authenticity, usually with a username and password. If the authentication was successful, the CAS will redirect the client back to the application along with a **service ticket**. The **service ticket** acts like an authorization code in the OAuth / OIDC protocol. The application then uses the service ticket, along with its own application identifier, to determine the validity of said ticket with the CAS server. CAS will then return information to the application regarding the particular user and if they successfully authenticated with CAS or not.
>
## LDAP
Lightweight Directory Access Protocol, or LDAP, is an application protocol used for the sharing of information about users, systems, networks, services, and applications throughout a network. An exampleof a direcotry service may be a corporate email directory or a telephone directory list which include subscriber addresses and phone numbers.
>
## SAML
Security Assertion Markup Language, or SAML, is a standard used for "exchanging authentication and authorization data between parties, in particular, between an identity provider and a service provider". SAML addresses the problem of SSO across security domains.
>
SAML specifies three roles: the _principal_, the _identity provider_ (IdP), and the _service provider_ (SP). The usual way in which these roles interact is the following:
>
"A principal requests a service from the service provider. The service provider requests and obtains an authentication assertion from the identity provider. On the basis of this assertion, the service provider can make an access control decision, that is, it can decide whether to perform the service the connected principal".
>
"Before delivering the subject-based assertion to the service provider, the identity provider may request some information from the principal--such as a user name and password--in order to authenticate the principal. SAML specifies the content of the assertion that is passed from the identity provider to the service provider. In SAML, one identity provider may provide SAML assertions to many service providers. Similarly, one service provider may rely on and trust assertions from many independent identity providers.
>
SAML does NOT specify the method of authentication at the identity provider.
>
## Shibboleth
Shibboleth is a SSO system for computer networks and the internet that uses SAML-based, federated identity-based authentication and authorization. Shibboleth Identity Provider and Shibboleth Service Provider are both implementations of SAML. In the case of Shibboleth implmementations, the Shibboleth Identity Provider supplies user information while the Shibboleth Service Provider consumes this information and gives access to secure content.



## SSO
Single Sign-On, or SSO, is a property of access control that permits a user access to a variety of related systems with a single ID and password. It is an agreement between users, identity providers, and service providers. From [Michael Bissell](https://www.youtube.com/watch?v=t2Cnn1o2DG4):
>
> Users are individiaul people who need access to different services. Users should be able to manage personal information such as their password, and they should be uniquely identifiable.
>
> Identity providers tell us about a user. It is the source of truth for not only who this person is, but also what roles they have -- those roles, in turn, inform other systems about what this person is allowed to do.
>
> Service providers are applications and products that the user is interfacing with.
>
Opposite of Single Sign-on is Single Sign-off, which is a property "whereby a single action of signing out terminates access to multiple software systems".
>
Examples of SSO include CAS, Shibboleth, OIDC, and OAuth.
>
>
# Shibboleth vs CAS
Both are used to implement a centralized Single Sign-On (SSO)
