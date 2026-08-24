*REFERENCES :*
Pocketbase auth docs - https://pocketbase.io/docs/authentication/ 


// notes taken directly from supabase auth docs.....

A single client is considered authenticated as long as it sends valid **Authorization:YOUR_AUTH_TOKEN** header with the request.

The **PocketBase** Web APIs are **fully stateless** and there are **no sessions in the traditional sense** (even the tokens are not stored in the database).

Because there are no sessions and we don't store the tokens on the server there is also no logout endpoint. To "logout" a user you can simply disregard the token from your local state (aka. pb.authStore.clear() if you use the SDKs).

The auth token could be generated either through the specific auth collection Web APIs or programmatically via Go/JS.

All allowed auth collection methods can be configured individually from the specific auth collection options.

Rules :
1. Auth state is applied across all pages
2. session token is refreshed every 10 minutes
3. session token will refresh if inactive for 1 minute 