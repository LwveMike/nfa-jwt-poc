# NFA Authentication

## Authentication Flow description

### Preface

The authentication flow is based on 2 jwt tokens that will be saved in cookies:

- Access token:
  - Should be short lived.
  - Will contain non-sensitive information that the frontend can decode.
  - Will be signed with the private key of the access token.
  - Will be used to authenticate the user.

- Refresh token:
  - Should be long lived.
  - Will contain information that will link between the browser session to the session in the database.
  - Will be signed with the private key of the refresh token.
  - Will be used to refresh the access token.

### How it will work

By our norms, we will consider an authenticated request to the API if the user:

- Sends both `access-token` and `refresh-token` and they are both valid.
- Sends an expired `access-token` and a valid `refresh-token`:
  - The `access-token` will be refreshed and the `refresh-token` will be rotated [ The rotation of the `refresh-token` is not yet decided ].

There will also be endpoints that doesn't require authentication.

The backend should clean any inconsistencies with the cookies: If the `access-token` is expired, this means someone changed the lifetime of the cookie on the client side, this means the backend should delete the cookie from the response. And others such cases.

The frontend should implement a composables that will handle the authentication flow based on the access token.

**Cookies**
The only difference between the `cookie options` for `access-token` and `refresh-token` is the `httpOnly` option. Which should be set to `true` for the `refresh-token` and `false` for the `access-token`. This means that the `access-token` can be read by the `javascript` code in the browser, but the `refresh-token` is protected.

The expires of the cookies should be calculated based on the lifetime of the token.

Also the remaining options for cookies should be set to the most strictest mode.

**Database**
Session table should look like this:

- id: Primary Key
- userId: Foreign Key to the user table
- last_accessed_at: Last time the session was accessed
  - defaults to the current time ( used when the session is created )
- expires_at: Expiration time of the session
  - defaults to the current time + the lifetime of the token
- device: Device that the session was created on
  - defaults to 'unknown'
- os: Operating system of the device
  - defaults to 'unknown'
- ip: IP address of the device
  - defaults to null

**Role**
Role table should look like this:

## Requirements

### NFA initialization

We should create the keys when NFA is deployed on the clients' servers.

The way I generated them in the investigation phase was:

```bash
openssl ecparam -name prime256v1 -genkey -noout -out "$TOKEN_PREFIX-priv-key.pem"
openssl ec -in "$TOKEN_PREFIX-priv-key.pem" -pubout > "$TOKEN_PREFIX-pub-key.pem"
```

Where `$TOKEN_PREFIX` is the type of the token, eg. `access-token`.

If the person that will be doing this task, has a better way to do it, please let me know ( because we should change some things in the way the tokens are signed ).

The paths of the keys generated should be added to config.

### Config

```json
{
  // Path to public key for access token
  "jwt.access-token.pub.key": "/path/to/access-token/public.key",
  // Path to private key for access token
  "jwt.access-token.priv.key": "/path/to/access-token/public.key",
   /* Expiry should be represented in seconds, because we will do some calculations on it, for cookies and database time.
   */
   // Other formats supported: Eg: 60, "2 days", "10h", "7d"
  "jwt.access-token.expiry": 3600 // 1 hour,

  // Path to public key for refresh token
  "jwt.refresh-token.pub.key": "/path/to/refresh-token/public.key",
  // Path to private key for refresh token
  "jwt.refresh-token.priv.key": "/path/to/refresh-token/public.key",
  // Same format as jwt.access-token.expiry
  "jwt.refresh-token.expiry": 1209600 // 2 weeks
}
```

## Implementation

### NAPID

**ConfigService**
The service should be able to read the config file that is the `node-addon` from `c++` and from `.env` file located in `web`.

This service should also validate the values with `zod` and read the keys needed for `access-token` and `refresh-token`.

**RequestMetaService**
This service should have an internal private `WeakMap` that will use the `req` object as the key and decoded `access-token` as value.

Also is should have public methods that will allow setting and getting the value with the `req` argument.

**JwtService**
This will be used to create, sign, decode tokends, create cookies options and calculate the expiries of cookies.

**SessionService**
This will be used to create sessions, extract data from user agent and the forwarded ip from the `req` and also provide the session id for `refresh-token`.

**AuthenticationMiddleware**
This should use the `JwtService` to validate the tokens and as described in the Authentication Flow should handle all the cases.

This will be a global middleware and would run on all the endpoints except the one excluded.

In the **WebsocketsGateway** should be implemented code that will notify the user when a new session is created.

**Frontend**
Should have a composable that will take care of the authentication.

**Session Part Page**
We need to implement all the endpoints related to session management, and by the design from figma, the card that will allow to invalidate sessions.

**Task for cleaning stale session**
If by any scenario there will be a old session tied to nothing left in the database we should have a job that will clear that.

For a Proof of concept, you can access this repository: [nfa-jwt-poc](https://github.com/LwveMike/nfa-jwt-poc)
