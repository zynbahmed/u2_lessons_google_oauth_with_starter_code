 
<img src="https://i.imgur.com/ls8J7jU.jpg" width="40%">

# OAuth Authentication<br>with<br>Express & Passport

## Learning Objectives

| Students will be able to: |
|---|
| Explain the difference between Authentication & Authorization |
| Identify the advantages OAuth provides for users and businesses |
| Explain what happens when a user clicks "Login with [OAuth Provider]" |
| Add OAuth authentication to an Express app using PassportJS |
| Use Middleware & PassportJS to implement authorization |

## Road Map

1. Setup
2. Intro to Authentication
3. Why OAuth?
4. What is OAuth?
5. Preview the Completed `mongoose-movies` App
6. Today's OAuth Game Plan
    - **Step 1:** Register our App with Google's OAuth Server
    - **Step 2:** Define the `User` model
    - **Step 3:** Discuss PassportJS
    - **Step 4:** Install & Configure Session middleware
    - **Step 5:** Install PassportJS
    - **Step 6:** Create a Passport config module
    - **Step 7:** Install a Passport Strategy for OAuth
    - **Step 8:** Configure Passport
    - **Step 9:** Define routes for authentication
    - **Step 10:** Add Login/Logout UI
7. Code the User Stories
8. Implement Authorization
9. Challenge Exercise (optional)

## 1. Setup

This lesson will finalize mongoose-movies!

To start, clone down this repo and and move into mongoose-movies.

From there, `npm i`, `touch .env`, copy over your *DATABASE_URL* connection string and get ready to rumble.

Also make sure to create a `.gitignore` file and add you `.env` and `node_modules`. 

### Remove Any Existing Reviews

The upcoming user-centric change that's going to be made to the `reviewSchema` will prevent being able to add new reviews to any movie that currently has existing reviews (because they won't conform to the new schema).  

Let's go ahead and clear out our database and add some new movies and performers before we begin. 

## 2. Intro to Authentication

### Why We Need Authentication

An application's functionality typically revolves around a particular user.  This is what we refer to as user-centric CRUD.  

For example, when we use online banking, or more importantly, save songs to our Spotify playlists, the application has to know who we are - and this is where **authentication** comes in.

### What is Authentication?

Authentication is what enables an application to know the **identity** of the person using it.

This can be achieved by: 

- **Unit 2**: Logging in via a third-party provider (OAuth)
- **Unit 3**: Token-based username/password login
- **Unit 4**: Session-based username/password login

### Authentication vs. Authorization

_Authentication_ and _authorization_ are not the same thing...

**Authentication** verifies a user's identity.

**Authorization** determines what functionality a given user can access. For example:

- Features a logged in (authenticated) user has vs. an anonymous visitor
- Features an _admin_ user has vs. some other user _role_
- Only the user that added a given comment can delete that comment

## 3. Why OAuth?

Consider applications where we have to sign up and log in using a username and a password...

<details>
<summary>
❓ What pitfalls of username/password authentication can you think of from a user's perspective?
</summary>
<hr>

- Creating multiple logins requires you to remember and manage all of those login credentials.

- You will often use the same credentials across multiple sites, so if there's a security breach at one of the sites where you are a member, the hackers know that users often use the same credentials across all of their sites - oh snap!

- You are tempted to use simple/weak passwords so that you can remember all of them.

<hr>
</details>

<details>
<summary>
❓ What might be the pitfalls of username/password authentication from a business that owns the web app point of view?
</summary>
<hr>

- Managing users' credentials requires carefully crafted security code written by highly-paid developers.

- Users (customers) are annoyed by having to create dedicated accounts, especially for entertainment or personal interest type websites.

- Managing credentials makes your business a target for hackers (internal and external) and that brings with it liability.

<hr>
</details>

The bottom-line is that users prefer to use OAuth instead of creating another set of credentials to use your site.

When users are your customers, you want to make them as happy as possible!

OAuth is hot, so let's use it!

## 4. What is OAuth?

### A Bit of OAuth Vocabulary

- **[OAuth 2.0](https://oauth.net/2/)**: The current OAuth standard.  Version 1.0 is obsolete and should not be used.

- **OAuth provider**: A service company such as _Google_ that makes its OAuth authentication service available to third-party applications.

- **client application**: Our web application!  Remember, this is from an _OAuth provider's_ perspective.

- **owner**: A user of a service such as _Facebook_, _Google_, _Dropbox_, etc.

- **resources**: An _owner's_ information on a service that **may** be exposed to _client applications_. For example, a user of Dropbox may allow access to their files.

- **access token**: An temporary key that provides access to an _owner's_ _resources_.

- **scope**: Determines what _resources_ and rights (read-only, update, etc) a particular _token_ has.

### What is it?

OAuth, short for Open Authorization, is an standard protocol that provides **client applications** access to **resources** of a service such as Google with the permission of the resources' **owner**.

Oauth allows third-party applications to access a user's resources (like information or services) on a server without exposing the user's credentials, such as usernames and passwords. 

When you authenticate with Google using OAuth, the client application (the third-party app or service you're using) does not have direct access to your password. Instead, OAuth uses a token-based system to provide access.

Here's how it generally works:

1. You click "Sign in with Google" on a third-party app.
2. You are redirected to Google's login page.
3. You enter your Google username and password on Google's secure page.
4. Google authenticates you and asks whether you want to grant the third-party app access to your Google resources.
5. If you agree, Google generates an access token and possibly a refresh token.
6. The third-party app receives the access token, which it can use to access the agreed-upon resources on your behalf.

At no point does the third-party app directly handle or store your Google password. Instead, it obtains a limited-use access token that represents your authorization.

There are numerous OAuth Providers including:

- Facebook
- Google
- GitHub
- Twitter
- [Many more...](https://en.wikipedia.org/wiki/List_of_OAuth_providers)

### OAuth 2's Flow & Scope

<img src="https://i.imgur.com/pgb5FN9.png">

The above image, taken from [this excellent article](https://darutk.medium.com/diagrams-and-movies-of-all-the-oauth-2-0-flows-194f3c3ade85), diagrams the flow of logging in using OAuth 2.0.

The ultimate goal is for the _client application_ (our web app) to obtain an **access token** from an OAuth provider that allows the app to access the user's resources from that provider's API's.

OAuth is **token** based.   

Each token has a **scope** that determines what resources an app can access for that user.

For mongoose-movies, as is the case with many applications, we are only interested in using OAuth for identifying who the user is by accessing their basic profile info (**name**, **email** & **avatar**).

If an application needs to access more than a user's basic profile, the **scope** would need to be expanded as dictated by the specific provider's documentation on how to access additional resources.

Yes, OAuth is complex. But not to worry, we don't have to know all of the nitty gritty details in order to take advantage of it because we will be using PassportJS middleware that will handle most of the "OAuth dance" for us.

Still confused?  Check out [this link](https://blog.postman.com/what-is-oauth-2-0/) for more info. 

### A Playful Way to Understand how Oauth Works

Imagine Nabeel and Salman are students who want to access a super cool club (OAuth-protected resources), but they need special VIP passes (tokens) to get in. Here's how it goes:

#### Authentication Club
Think of OAuth as the "Cool Club" where all the fun stuff (data) is happening.

#### VIP Pass (Token)
The VIP pass is like a magical key that lets Nabeel and Salman into different parts of the club. Without it, they're stuck outside.

#### Permission Permission
Before getting the VIP pass, Nabeel and Salman need permission from the "Club Owners" (you, the user) to enter. You, as the user, decide if they can come in.

#### VIP Pass Request
After getting the permission nod, Nabeel and Salman ask the "Bouncer" (OAuth server) for their special VIP passes.

#### Special Access
The VIP passes grant them access to specific zones of the club (data or services) - maybe the dance floor or the gaming area.

#### Party Rules (Scope)
The VIP passes have party rules (scope) written on them. Nabeel's pass might let him dance, while Salman's pass allows him to play games. They can't do what the other's pass allows.

#### Party Time Limit
The VIP passes have an expiration time. After a certain period, they become invalid. So, Nabeel and Salman need to enjoy the party before their passes expire.

In this way, Nabeel and Salman, our student adventurers, are navigating the OAuth club to access the fun zones, all while following the rules set by the "Club Owners" and the "Bouncer." It's a playful way to understand how OAuth works in granting access!


### ❓ OAuth Review Questions

<details>
<summary>
(1) True or False: If your site allows users to authenticate via OAuth, you should ensure they create a "strong" password.
</summary>
<hr>

**False** - Trick question because users won't be providing a password to our site if we use OAuth 😀

<hr>
</details>

<details>
<summary>
(2) To an OAuth provider, such as Google, what is the <em>client application</em>?
</summary>
<hr>

**Our web application/server**

<hr>
</details>

## 5. Preview the Completed `mongoose-movies` App

[The deployed mongoose-movies](https://mongoose-movies-sei.herokuapp.com/movies) includes OAuth authentication & authorization.

Here are some of the differences in the final code vs. where the app is now:

- The ability to log in and out with Google OAuth has been implemented.
- The navbar dynamically renders its links based upon whether a user is logged in or not.
- A `User` model has been added and when a user logs in for the first time the user is added to the database.
- The `Movie --< Review` relationship has been updated to be "user-centric", i.e., `Movie --< Review >-- User`

## 6. Today's OAuth Game Plan

Ready for some OAuth?  Here's today's game plan:

- **Step 1:** Register our App with Google's OAuth Server
- **Step 2:** Define the `User` model
- **Step 3:** Discuss PassportJS
- **Step 4:** Install & Configure Session middleware
- **Step 5:** Install PassportJS
- **Step 6:** Create a Passport config module
- **Step 7:** Install a Passport Strategy for OAuth
- **Step 8:** Configure Passport
- **Step 9:** Define routes for authentication
- **Step 10:** Add Login/Logout UI

Yep, lots of fun ahead...

### Step 1 - Register our App

Every OAuth provider requires that our web app be registered with it.

When we do so, we obtain a **Client ID** and a **Client Secret** that identifies **our application** to the OAuth provider.

For this lesson, we are going to use [Google's OAuth provider](https://developers.google.com/identity/protocols/OAuth2).

Time to register our app...

#### Step 1.1 - Google Developers Console

- You must be logged into the [console for Google's Cloud Platform Console](https://console.developers.google.com).  Here's what you'll see once logged in to the console for the first time and consent to the Terms of Service:

<img src="https://i.imgur.com/OjjoaRx.png">

#### Step 1.2 - Create a Project

- Click **Select a project**:

<img src="https://i.imgur.com/XuqQCLu.png">

- Click **NEW PROJECT**:

<img src="https://i.imgur.com/ylSC8mW.png">

- Update the **Project name** to something like `mongoose-movies`, then click **CREATE**:

<img src="https://i.imgur.com/dgKSFOG.png">

> Note: The project name must be globally unique, so Google will append an additional id to the name you provide.

- It might take a bit to create the project.  When done, click SELECT PROJECT:

<img src="https://i.imgur.com/tPviNAe.png">

#### Step 1.3 - Enable the People API

- So that we can access the user's basic profile, we'll need to enable the People API.

- Click **Go to APIs overview**: 

<img src="https://i.imgur.com/dqFFhh3.png">

- Click **+ ENABLE APIS AND SERVICES**:

<img src="https://i.imgur.com/HO1KJjY.png">

- Search for **people** and click on **Google People API** when it is visible:

<img src="https://i.imgur.com/pUEqE4y.png">

- Click **ENABLE**:

<img src="https://i.imgur.com/ylHcvQK.png">

#### Step 1.4 - Obtain Credentials for App

- Now we need to create credentials for the app. Click **CREATE CREDENTIALS**:

<img src="https://i.imgur.com/nayg9Ve.png">

- Select **User data** then click **NEXT**:

<img src="https://i.imgur.com/FvPfXrY.png">

- Under **OAuth Consent Screen** provide a friendly **App name**, select the **User support email**, **leave App Logo blank**, type in a developer **Email address** then click SAVE AND CONTINUE:

<img src="https://i.imgur.com/pSuDMeV.png">

- Ignore the **Scopes** section by clicking **SAVE AND CONTINUE** (you may have to scroll down a bit):

<img src="https://i.imgur.com/KrZDT91.png">

- In the dropdown, select **Web application**, then click the **+ ADD URI** in the **Authorized redirect URIs**:

<img src="https://i.imgur.com/Va5Ef86.png">

- Copy/paste `http://localhost:3000/oauth2callback` into the **URIs 1** input then click **CREATE**:

<img src="https://i.imgur.com/UfwhOaA.png">

> 👀 You will have to add an _**additional**_ entry in the **Authorized redirect URIs** once you have deployed your application to Heroku - something like `https://<your app name>.herokuapp.com/oauth2callback`.

- We now need to change the publishing status so that anyone can log in.  Click the **OAuth consent screen page** link:

<img src="https://i.imgur.com/h9MbE5z.png">

- Click the **PUBLISH APP** button:

<img src="https://i.imgur.com/uI9QDhX.png">

- Click the **CONFIRM**:

<img src="https://i.imgur.com/ztX7wvL.png">

- Awesome. Now let's go view our credentials by clicking **Credentials** in the side menu:

<img src="https://i.imgur.com/Wbu1uKR.png">

- Click the **Web client 1** link:

<img src="https://i.imgur.com/gjK4cEk.png">

#### Step 1.5 - Add the Client ID and Client Secret to `.env`

Strangely, we either have to make our browser window very narrow or very large in order to see the **Client ID** and the **Client secret**:

<img src="https://i.imgur.com/S1RcEu4.png">

Now we can add the credentials, along with that callback URI we provided, to the `.env` file so that it looks something like this:

```
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0-oxnsb.azure.mongodb.net/mongoose-movies?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=245025414218-2r7f4bvh3t88s3shh6hhagrki0f6op8t.apps.googleusercontent.com
GOOGLE_SECRET=Yn9T_2BKzxr5zgprzKDGI5j3
GOOGLE_CALLBACK=http://localhost:3000/oauth2callback
```

> 👀 Registering a project with other OAuth providers will be similar, but unique to that provider.

**Congrats on Registering your App with Google's OAuth Service!**

### Step 2 - Define the `User` Model

Let's start by defining a minimal `User` model:

1. Create the Node module:

    ```
    touch models/user.js
    ```

2. Define the minimal schema, compile the schema into a `User` model and export it:

    ```js
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const userSchema = new Schema({
      name: String
    }, {
      timestamps: true
    });

    module.exports = mongoose.model('User', userSchema);
    ```

We will add additional properties once we "discover" what user info Google provides us with.

### Step 3 - Passport Discussion

Implementing OAuth is complex. There are redirects going on everywhere, access tokens that only last for a short time, refresh tokens used to obtain a fresh access token, etc.

As usual, we will stand on the shoulders of giants that have done much of the heavy lifting for us - enter [PassportJS](http://www.passportjs.org/).

Passport is by far the most popular authentication framework out there for Express apps.

[Passport's website](http://passportjs.org/) states that it provides _Simple, unobtrusive authentication for Node.js_.

Basically this means that it handles much of the mundane tasks related to authentication for us, but leaves the details up to us, for example, not forcing us to configure our user model a certain way.

There are numerous types of authentication, if Passport itself was designed to do them all, it would be ginormous!

Instead, Passport uses **Strategies** designed to handle a given type of authentication. Think of them as plug-ins for Passport.

Each Express app with Passport can use one or more of these strategies.

[Passport's site](http://passportjs.org/) currently shows over 500 strategies available.

OAuth2, although a standard, can be implemented slightly differently by OAuth providers such as Facebook and Google.

As such, there are strategies available for each flavor of OAuth provider.

For this lesson, we will be using the [passport-google-oauth](https://github.com/jaredhanson/passport-google-oauth) strategy.

Passport is just middleware designed to authenticate requests.

**IMPORTANT INFO BELOW**

When a request is sent from an authenticated user, Passport's middleware will automatically add a `user` property to the `req` object.

**👀 `req.user` will be the logged in user's Mongoose document❗️**

If a user is not logged in, `req.user` will be `undefined`.

You will then be able to access the `req.user` document in all of the controller actions - so, DO NOT write code to retrieve the user document from the DB because `req.user` is already the document!

### Step 4 - Session Middleware

Before we install Passport and a strategy, we need to install the [`express-session`](https://github.com/expressjs/session?_ga=1.40272994.1784656250.1446759094) middleware.

This middleware helps the server remember a user's browser session by using a session id stored in a cookie. Passport uses this session to save important data for looking up users in the database. 

In the context of Passport middleware, cookies are often used to maintain a user's session and authentication state across multiple HTTP requests. When a user logs in, Passport typically serializes the user information into a session, and this serialized user information is stored in a cookie.

#### Step-by-step overview of the process:

1. **Serialization:** When a user logs in, Passport serializes the user information. Serialization involves converting the user object into a format that can be easily stored and later reconstructed.

2. **Cookie Storage:** The serialized user information is then stored in a cookie. This cookie is sent to the user's browser and is usually set to expire after a certain period. The cookie is often signed or encrypted to ensure its integrity and security.

3. **Subsequent Requests:** In subsequent requests, the user's browser automatically includes the cookie containing the serialized user information. Passport middleware, specifically the `passport.initialize()` and `passport.session()` middleware, is responsible for deserializing the user information from the cookie and attaching it to the request object.

4. **Deserialization:** Passport deserializes the user information by extracting it from the cookie. The deserialized user object is then attached to the `request.user` property, making it accessible to route handlers.

5. **Authentication State:** The `request.user` property now holds the authenticated user's information, allowing the application to check if the user is authenticated and retrieve additional details from the user object stored in the database.

Think of the session middleware as the organizer at a party. When a guest (user) arrives, the organizer hands them a special wristband (cookie with a session id). This wristband is the express-session middleware at work. It helps the server (organizer) recognize the guest and remember details about them throughout the party (user's interactions with the website).

So, when you install the express-session middleware, you essentially set up this wristband system. The middleware takes care of creating and managing these special wristbands (cookies with session ids) for each visitor. It enables your Express backend to handle and remember user sessions seamlessly.

#### Step 4.1 - Installing Session Middleware

Let's install the module:

```
npm install express-session
```

Next, require it below the `logger`:

```js
var logger = require('morgan');
// new code below
var session = require('express-session');
```

#### Step 4.2 - Add a SECRET to `.env`

When session middleware is configured, it will require a "secret" string that it uses to digitally sign the session cookie.  Let's add the secret to the `.env`:

```
...
GOOGLE_CALLBACK=http://localhost:3000/oauth2callback
SECRET=SEIRocks
```

#### Step 4.3 - Configure and Mount Session Middleware

Now, we can configure and mount the session middleware below the `express.static` middleware:

```js
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
```

The `resave` and `saveUninitialized` settings, they are being set to suppress deprecation warnings.

#### Step 4.4 - Verifying Session Middleware

Make sure your server is running with nodemon.

Browse to the app at `localhost:3000`.

Open the _Application_ tab in _DevTools_, then expand _Cookies_ in the menu on the left.

A cookie named `connect.sid` confirms that the session middleware is doing its job.

The connect.sid cookie plays a crucial role in tracking user sessions within web applications. Typically associated with the express-session middleware in Express.js, it functions by generating a unique session ID for each user. This session ID is then stored in the connect.sid cookie, which is sent to the user's browser. In subsequent requests, the server utilizes this cookie to identify and retrieve the corresponding user session data, allowing for seamless session management.

When a user interacts with your application and sends a request to the server, the session id stored in the cookie is sent along with that request. This session id serves as a way for the server to identify and associate the incoming request with a specific user session.

So, with each request, the server checks the session id in the cookie, retrieves the associated session data, and then can use that information to understand and manage the user's session, such as determining if the user is authenticated and accessing their stored data. It helps in maintaining the continuity of the user's experience across different interactions with the application.

<details>
<summary>
Click me for a better explanation 
</summary>
<hr>

### Express-Session Middleware and Cookie Creation

1. **Client Request:**
   - When a user interacts with the server (e.g., logging in), the server responds not only with data but also with instructions for the client's browser.

2. **Set-Cookie Header:**
   - The server, using express-session middleware, includes a "Set-Cookie" header in its response. This header contains session information, including the session id.

3. **Browser Stores Cookie:**
   - The client's browser receives this response, sees the "Set-Cookie" header, and stores the provided cookie (containing the session id) locally.

4. **Subsequent Requests:**
   - In future requests, the stored cookie is automatically included in the request headers. This allows the server to identify and associate the request with the correct user session.

This process enables seamless session management and user recognition in subsequent interactions with the application.
<hr>
</details>

<details>
<summary>
Click me for another way of explaining this concept. 
</summary>
<hr>
	
### Passport and Express-Session Simplified

1. **User Authentication:**
   - Passport checks if a user is valid during login.

2. **Session Handling:**
   - Express-session creates a special ID (cookie) for the user's browser.

3. **User Info in Session:**
   - Passport uses this ID to store a bit of user info on the server.

4. **Subsequent Requests:**
   - On future visits, the server uses the ID to recall user info.

5. **Adding User to `req`:**
   - Passport puts user info in `req`, making it easy to use in routes.

Now, your app can remember who's logged in without asking for credentials each time!
<hr>
</details>

**Congrats, the session middleware is now in place!**

Time for a few questions...

#### ❓ Review Questions (1 min)

<details>
<summary>
(1) Before a web app can use an OAuth provider, it must first r__________ with it to obtain a client ____ and a client secret.

</summary>
<hr>

...it must first **register** with it to obtain a client **ID** and a client secret.

<hr>
</details>

<details>
<summary>
(2) Passport uses s__________ designed to handle specific types of authentication.
</summary>
<hr>

**strategies**

<hr>
</details>

<details>
<summary>
(3) If there is an authenticated user, the request (<code>req</code>) object will have what property attached to it by Passport?
</summary>
<hr>

**`req.user`**

<hr>
</details>


### Step 5 - Install Passport

The Passport middleware is easy to install, but challenging to configure correctly.

First the easy part:

```
npm i passport
```

Require it as usual below `express-session`:

```js
var session = require('express-session');
// new code below
var passport = require('passport');
```

#### Step 5.1 - Mount Passport

With Passport required, we need to mount it. Be sure to mount it **after** the session middleware and always **before** any of the routes that would need access to the current user:

```js
// server.js

// app.use(session({... code above

app.use(passport.initialize());
app.use(passport.session());
```
	
The way `passport` middleware is being mounted is straight from the docs.

### Step 6 - Create a Passport Config Module

Because it takes a significant amount of code to configure Passport, we will create a separate module so that we don't pollute **server.js**.

Let's create the file:

```
touch config/passport.js
```

In case you're wondering, although the module is named the same as the `passport` module we've already required, it won't cause a problem because a module's full path uniquely identifies it to Node.

#### Step 6.1 - Passport Module's Exports Code 

Our `config/passport` module is not middleware.

Its code will basically configure Passport and be done with it. We're not going to export anything either.

Requiring below our database is as good of a place as any in **server.js**:

```js
// server.js

require('./config/database');
// new code below
require('./config/passport');
```

#### Step 6.2 - Require Passport 

In the **config/passport.js** module we will certainly need access to the `passport` module:

```js
// config/passport.js

const passport = require('passport');
```

Now on to the _strategy_...

### Step 7 - Install the OAuth Strategy

Time to install the strategy that will implement Google's flavor of OAuth:

```
npm i passport-google-oauth
```

This module implements Google's OAuth 2.0 and 1.0 API. 

Note that _OAuth 1.0_ does still exist here and there, but it's obsolete.

#### Step 7.1 - Require the OAuth Strategy

Now let's require the `passport-google-oauth` module below that of `passport` in **config/passport.js**:

```js
const passport = require('passport');
// new code below
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
```

Note that the variable is named using upper-camel-case.

<details>
<summary>
❓ What does this naming convention typically hint at?
</summary>
<hr>

**The it's a `class`**

<hr>
</details>

Let's make sure there's no errors before moving on to the fun stuff!

### Step 8 - Configuring Passport

To configure Passport we will:

1. Call the `passport.use()` method to plug-in an instance of the OAuth strategy and provide a _verify_ callback function that will be called whenever a user has logged in using OAuth.

2. Call the `passport.serializeUser()` method to provide a callback that Passport will call after the _verify_ callback.

3. Call the `passport.deserializeUser()` method to provide a callback that Passport will call for every request when a user is logged in.

#### Step 8.1 `passport.use()`

Time to call the `passport.use()` method to plug-in an instance of the OAuth strategy and provide a _verify_ callback function that will be called whenever a user logs in with OAuth.

In **config/passport.js**:

```js
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// new code below
passport.use(new GoogleStrategy(
  // Configuration object
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  // The verify callback function
  // Let's use async/await!
  async function(accessToken, refreshToken, profile, cb) {
    // A user has logged in with OAuth...
  }
));
```

Note the settings from the `.env` file being passed to the `GoogleStrategy` constructor function.

Next we have to code the _verify_ callback function...

#### Step 8.2 - The Verify Callback

The _verify_ callback will be called by Passport when a user has logged in with OAuth.

It's called a _verify_ callback because with most other strategies we would have to verify the credentials, but with OAuth, well, there are no credentials!

<details>
  <summary>Click for a more detailed explanation</summary>

  When implementing OAuth authentication in a Node.js application using Passport.js, a key concept is the "verify callback." This callback function is invoked by Passport.js after a user successfully logs in with OAuth.

  **Verify Callback**

  The verify callback is a function you define to handle the verification of the user's identity. It is provided to Passport.js when configuring the OAuth strategy. The callback receives the user's profile information obtained from the OAuth provider.

  **Passport and OAuth**

  Passport.js is a middleware that simplifies the authentication process in Node.js. When using OAuth with Passport, traditional username and password verification are not applicable. OAuth relies on tokens exchanged between the application and the OAuth provider.

  **Credentials in OAuth**

  In OAuth, there are no direct username and password inputs from the user. Instead, they log in through a third-party provider (e.g., Google), and the provider confirms their identity by supplying an access token. The "credentials" in OAuth refer to these tokens, managed by the OAuth provider.

  In summary, the verify callback is a crucial part of OAuth integration with Passport.js, handling the verification of user identity based on information provided by the OAuth provider, as there are no traditional credentials in the OAuth authentication process.
</details>

In this callback we must:

- Fetch the user from the database and provide them back to Passport by calling the `cb()` callback function, or...

- If the user does not exist, we have a new user! We will add them to the database and pass along this new user in the `cb()` callback function.

But wait, how can we tell what user to lookup?

Looking at the callback's signature:

```js
function(accessToken, refreshToken, profile, cb) {
```
	
We can see that we are being provided the user's `profile` by Google.

If we were to inspect this `profile` object, we'd find the following useful properties:

- **`id`**: The user's _Google Id_ that uniquely identifies each Google account.
- **`displayName`**: The user's full name.
- **`emails`**: An array of email objects associated with the account.
- **`photos`**: An array of avatar image objects associated with the account.

Let's add these field to our `User` model's schema to hold it...

#### Step 8.3 - Modify the `User` Model

Let's add a property for `googleId` to our `userSchema` inside `models/user.js` file:

```js
const userSchema = new Schema({
  name: String,
  googleId: {
    type: String,
    required: true
  },
  email: String,
  avatar: String
}, {
  timestamps: true
});
```

Cool, now when we get a new user via OAuth, we can use the Google `profile` object's info to create our new user!

#### Step 8.4 - Verify Callback Code

Now we need to code the callback!

We're going to need access to our `User` model:

```js
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// new code below
const User = require('../models/user');
```

Cool, here comes the code for the entire `passport.use` method. We'll review it as we type it in...

```js
passport.use(new GoogleStrategy(
  // Configuration object
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  // The verify callback function...
  // Marking a function as an async function allows us
  // to consume promises using the await keyword
  async function(accessToken, refreshToken, profile, cb) {
    // When using async/await  we use a
    // try/catch block to handle an error
    try {
      // A user has logged in with OAuth...
      let user = await User.findOne({ googleId: profile.id });
      // Existing user found, so provide it to passport
      if (user) return cb(null, user);
      // We have a new user via OAuth!
      user = await User.create({
        name: profile.displayName,
        googleId: profile.id,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value
      });
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }
));
```

#### Step 8.5 `serializeUser()` & `deserializeUser()` Methods

With the `passport.use()` method done, we now need to code two more methods inside of `config/passport` module.

#### Step 8.6 `serializeUser()` Method

After the verify callback function returns the user document, passport calls the `passport.serializeUser()` method's callback passing that same user document as an argument.

It is the job of that callback function to return the nugget of data that passport is going to add to the **session** used to track the user:

```js
// Add to bottom of config/passport.js
passport.serializeUser(function(user, cb) {
  try {
    if (!user._id) {
      throw new Error("User object is missing _id property");
    }
    cb(null, user._id);
  } catch (err) {
    cb(err);
  }
});
```

By using the MongoDB `_id` of the user document we can easily retrieve the user doc within the `deserializeUser()` method's callback...

Passport needs to be able to serialize and deserialize users to support persistent login sessions.

Passport uses the user ID to serialize the user object.

The user ID is saved to the session and is later used to retrieve the entire user object via the deserializeUser function.

#### Step 8.7 `deserializeUser()` Method

The `passport.deserializeUser()` method's callback function is called every time a request comes in from an existing logged in user.

The callback needs to return what we want passport to assign to the `req.user` object.

Code it below the `passport.serializeUser()` method:

```js
// Add beneath searilizeUser
passport.deserializeUser(async function(id, cb) {
  try {
    const user = await User.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});
```

Let's do another error check.


### Step 9 - Define Routes for Authentication

We're going to need three auth related routes:

1. A route to handle the request sent when the user clicks Login with Google

2. The `/oauth2callback` route that we told Google to call after the user confirms or denies the OAuth login.

3. Lastly, we will need a route for the user to logout.

#### Step 9.1 Coding the Routes...

We're going to code these three new auth related routes in the existing `routes/index` module.

These new routes will need to access the `passport` module, so let's require it in **routes/index.js**:

```js
// routes/index.js

var router = require('express').Router();
// new code below
const passport = require('passport');
```

#### Step 9.2 Login Route

In **routes/index.js**, let's add the login route below the root route:

```js
// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  // Which passport strategy is being used?
  'google',
  {
    // Requesting the user's profile and email
    scope: ['profile', 'email'],
    // Optionally force pick account every time
    // prompt: "select_account"
  }
));
``` 

The `passport.authenticate()` method will return a middleware function that does the coordinating with Google's OAuth server.

The user will be presented the consent screen if they haven't previously consented.

**Note:** The code for configuring the Passport strategy and handling the OAuth route serves distinct purposes in user authentication. The configuration code for Passport strategy, with passport.use, passport.serializeUser, and passport.deserializeUser, sets up the strategy for interacting with Google OAuth. It defines how user authentication should be conducted and how user data is serialized for session storage.

On the other hand, the code for the `/auth/google` route is responsible for initiating the Google OAuth process when a user clicks on a "Login with Google" button. This route, defined in the router, utilizes passport.authenticate as middleware to trigger the Google authentication strategy. The middleware specifies which strategy to use ('google') and the permissions requested from the user (scope). When a user accesses this route, they are redirected to Google's OAuth consent screen to grant necessary permissions.

Once granted, Google redirects the user back to your application, and Passport.js takes care of exchanging the authorization code for user information, ultimately storing the user in the session for future requests. The route, therefore, plays a crucial role in the user authentication flow, seamlessly integrating with the Passport.js configuration to handle the complexities of OAuth-based authentication in a web application.

#### Step 9.3 Google Callback Route

Below the login route we just added, let's add the "callback" route that Google will call after the user confirms:

```js
// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect: '/movies',
    failureRedirect: '/movies'
  }
));
```

Note that we can specify the redirects for a successful and unsuccessful login. For this app, we will redirect to our main `/movies` route in both cases.

<details>
<summary>Click for a more detailed explanation</summary>
When a user successfully grants permission on the Google OAuth consent screen, Google will redirect them back to your application, specifically to the /oauth2callback route. It's important to note that the path /oauth2callback is commonly used, but you have the flexibility to choose a different path that aligns with your application's structure and naming conventions.

Passport.js and the Google OAuth strategy will then take care of exchanging the authorization code for user information using the callback function defined in the strategy configuration. Ensure that the callback route specified in your code matches the redirect URI configured in the Google Cloud Console where you set up OAuth credentials. The paths need to be consistent for the authentication flow to work seamlessly.

If the authentication is successful, the user is redirected to the specified success URL (/movies), and if it fails, they are redirected to the failure URL (/movies). The success and failure redirects are customizable based on the application's requirements.

In summary, the callback route, such as /oauth2callback, acts as the endpoint where Google redirects users after granting permission, and Passport.js processes the callback to complete the authentication process. It plays a crucial role in finalizing the OAuth flow, and it's essential that the specified path matches the configuration in the Google Cloud Console for a smooth authentication experience.
</details>

#### Step 9.4 Logout Route

The last route to add is the route that will logout the user:

```js
// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function() {
    res.redirect('/movies');
  });
});
```
	
The `logout()` method was automatically added to the `req` object by Passport!

Good time to do another error check.

### Step 10 - Add Login/Logout UI

We want the nav bar in **views/partials/header.ejs** to update dynamically depending upon whether there's an authenticated user or not:

<img src="https://i.imgur.com/TPzABUk.png">
<br>

**versus**

<img src="https://i.imgur.com/0tt4eu3.png">

#### Step 10.1 Pass `req.user` to All Views via `res.locals` & Middleware

Instead of having to pass `req.user` every time we render a template, let's take advantage of Express' [res.locals](https://expressjs.com/en/api.html#res.locals) object and a tidy custom middleware function:

In **server.js**:

```js
app.use(passport.session());

// Add this middleware BELOW passport middleware
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});
```

Now the logged in user is in a `user` variable that's available inside all EJS templates!

If nobody is logged in, `user` will be `undefined`.

#### Step 10.2 Add the Login / Logout UI Logic

We're going to use an `if`/`else` block in the EJS to dynamically render the nav links depending upon whether there is a logged in user or not.

Here's the updated `<nav>` element in **partials/header.ejs**:

```html
<nav>
  <img src="/images/camera.svg">
  <a href="/movies" <%- title === 'All Movies' ? 'class="active"' : '' %>>ALL MOVIES</a>
  <% if (user) { %>
    <a href="/performers/new"	<%- title === 'Add Performer' ? 'class="active"' : '' %>>
		ADD PERFORMER</a>
    <a href="/movies/new" <%- title === 'Add Movie' ? 'class="active"' : '' %>>ADD MOVIE</a>
    <a href="/logout">LOG OUT</a>
  <% } else { %>
    <a href="/auth/google" class="login">LOG IN&nbsp;<img src="https://i.imgur.com/FHjYyi0.png"></a>
  <% } %>
</nav>
```

There's a `class="login"` in use - add the following to the bottom of **public/stylesheets/style.css**:

```css
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 34px;
}

.login img {
  height: 30px;
}
```

#### Step 10.3 Try Logging In/Out!

We've finally got to the point where you can test out our app's authentication!

For Frodo!

<img src="https://i.imgur.com/413VjkQ.jpg" width="60%">


## 7. Code the User Stories

Our first user story reads:

> AAU, I want to add reviews for a movie when I'm logged in.

We already have a `<form>` for creating reviews on the **views/movies/show.ejs** template.

However, we **only** want this UI to show when there's a logged in user.

### 👉 You Do - Hide/Show Review `<form>` (2 minutes)

Using an `<% if %>` EJS block in **views/movies/show.ejs**, render the `<form>` for adding a review ONLY if there's a logged in user.

<details>
<summary>
Solution
</summary>
<hr>

```html
<!-- Add the line below -->
<% if (user) { %>
  <form id="add-review-form" method="POST" action="/movies/<%= movie._id %>/reviews">
    <label>Review:</label>
    <textarea name="content"></textarea>
    <label>Rating:</label>
    <select name="rating">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    </select>
    <input type="submit" value="Add Review">
  </form>
<!-- Add the line below -->
<% } %>
```

<hr>
</details>

### Update the `reviewSchema`

We're going to make three changes to the `reviewSchema` to make it user-centric:

1. Add a `user` property that references the user's `ObjectId` that created the review.
2. To avoid having to populate review sub-docs just to display the user's name with them, we're also going to add a `userName` property.
3. Similar to `userName`, let's also add a `userAvatar` property.

Update `reviewSchema` in **models/movie.js**:

```js
const reviewSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  // Don't forget to add the comma above then
  // add the 3 new properties below
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  userAvatar: String
}, {
  timestamps: true
});
```

> Note that `required: true` has been added to prevent "orphan" reviews. You'll want to do the same on other user-centric schemas as well.

### Update the `create` action in the Reviews controller

Much of an application's CRUD data operations pertain to the logged in user.

The [Guide to User-Centric CRUD using Express & Mongoose](https://gist.github.com/jim-clark/a714016bab26fad52106f6b2490e3eb7) will prove very helpful when coding your projects.

We've already added the necessary properties to the `reviewSchmea`, now let's update the `create` action in the **controllers/reviews.js** controller:

```js
async function create(req, res) {
  const movie = await Movie.findById(req.params.id);

  // Add the user-centric info to req.body (the new review)
  req.body.user = req.user._id;
  req.body.userName = req.user.name;
  req.body.userAvatar = req.user.avatar;

  // We can push (or unshift) subdocs into Mongoose arrays
  movie.reviews.push(req.body);
  try {
    // Save any changes made to the movie doc
    await movie.save();
  } catch (err) {
    console.log(err);
  }
  res.redirect(`/movies/${movie._id}`);
}
```

> Remember: `req.user` is the logged in user's Mongoose document!

### Update How Reviews are Being Displayed

Here's the updated **views/movies/show.ejs** that displays the user's name and avatar with each review:

```html
<table>
  <thead>
    <tr>
      <th>User</th>
      <th>Date</th>
      <th>Review</th>
      <th>Rating</th>
    </tr>
  </thead>
  <tbody>
    <% let total = 0 %>
    <% movie.reviews.forEach(function(r) { %>
      <% total += r.rating %>
      <tr>
        <td class="review-user"><img alt="avatar" src="<%= r.userAvatar %>" referrerpolicy="no-referrer" ><%= r.userName %></td>
        <td><%= r.createdAt.toLocaleDateString() %></td>
        <td><%= r.content %></td>
        <td><%= r.rating %></td>
      </tr>
    <% }); %>
    <tr>
      <td colspan="3"></td>
      <td><strong><%= (total / movie.reviews.length).toFixed(1) %></strong></td>
    </tr>
  </tbody>
</table>
```

> Note: The `referrerpolicy="no-referrer"` attribute added to the `<img>` cures Google's finickiness handling the browser's request for the avatar image.

Sprinkle in the the following CSS at the end of **public/stylesheets/style.css**:

```css
.review-user {
  display: flex;
  justify-content: center;
  align-items: center;
}

.review-user img {
  border-radius: 50%;
  height: 40px;
}
```

**Test the First User Story**

That should take care of our first user story - try it out!

<img src="https://i.imgur.com/zwYPXj4.png">

Yes, the UX is not that great because of the full-page refresh, but we'll address that when we develop single-page apps with React.

### Code the Next User Story

Our next user story reads:

> AAU, I want to be able to delete a review that I previously created.

We want to ensure that only the user that created a review can delete it.

As usual, we'll follow the 5 steps to add delete functionality...

#### Step 1 - Determine the Proper Route

<details>
<summary>
❓ What is the proper route to delete a review?
</summary>
<hr>

**`DELETE /reviews/:id`**

Although Reviews are a nested resource, the server doesn't need to know the id of the movie that the review is embedded within; thus the "shallow route".

<hr>
</details>

#### Step 2 - Display the UI to Send the HTTP Request

Nothing fancy...

Again, in **views/movies/show.ejs**:

```html
...
        <th>Rating</th>
        <!-- Add this placeholder header cell -->
        <th></th>
...
          <td><%= r.rating %></td>
          <!-- Add this td -->
          <td>
            <% if (user?._id.equals(r.user)) { %>
              <form action="/reviews/<%= r._id %>?_method=DELETE" method="POST">
                <button type="submit">X</button>
              </form>
            <% } %>
          </td>
```

The `user?._id...` is using JS's fresh [optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) (`?`) to avoid causing an error if `user` is not a an object (user not logged in).

The `_id.equals()` method is used to compare `_id`s - this is necessary because they are objects.

Lastly, looks like we need to install and mount `method-override` middleware:

```
npm i method-override
```

Require it:

```js
// server.js

var passport = require('passport');
// Add the line below 
var methodOverride = require('method-override');
```

Now let's mount it:

```js
app.use(express.static(path.join(__dirname, 'public')));
// Add the line below
app.use(methodOverride('_method'));
```

#### Step 3 - Define the Route

**👉 You Do - Define the `delete` Route (1 min)**

Add the new route for deleting a review to **routes/reviews.js** router.

<details>
<summary>
Solution
</summary>
<hr>

```js
// DELETE /reviews
router.delete('/reviews/:id', reviewsCtrl.delete);
```

<hr>
</details>

#### Step 4 - Code the `delete` Action

It's not enough to just hide the delete button when the review does not belong to the logged in user.

We should validate ownership in the controller action as well.  Again, using the [Guide to User-Centric CRUD using Express & Mongoose](https://gist.github.com/jim-clark/a714016bab26fad52106f6b2490e3eb7)...

```js
// controllers/reviews.js

module.exports = {
  create,
  // Add this export
  delete: deleteReview
};

async function deleteReview(req, res) {
  // Note the cool "dot" syntax to query on the property of a subdoc
  const movie = await Movie.findOne({ 'reviews._id': req.params.id, 'reviews.user': req.user._id });
  // Rogue user!
  if (!movie) return res.redirect('/movies');
  // Remove the review using the remove method available on Mongoose arrays
  movie.reviews.remove(req.params.id);
  // Save the updated movie doc
  await movie.save();
  // Redirect back to the movie's show view
  res.redirect(`/movies/${movie._id}`);
}
...
```

#### Step 5 - Render or Redirect

Already done in the above code!

Test it out!

Cool, just one step left!

## 8. Implement Authorization

<details>
<summary>
❓ What is <em>authorization</em>?
</summary>
<hr>

**Authorization** determines what functionality a given user can access.  For example, we don't want unauthenticated users to be able to delete reviews. 

<hr>
</details>

We've already coded some client-side authorization by:

- Conditionally displaying the `<form>` used to add reviews.
- Showing the delete button for only the reviews created by the logged in user.

We also performed a bit of server-side authorization by ensuring that the logged in user was the owner of the review being deleted.

In this step, we will see how we can easily protect the routes that require a user to be logged in, e.g., adding a movie or review.

Passport adds a nice method to the `req` object, `req.isAuthenticated()` that returns `true` or `false` depending upon whether there's a logged in user or not.

We're going to write our own little middleware function to take advantage of `req.isAuthenticated()` to perform some authorization.

### Code the Authorization Middleware

Since we want to protect routes defined in multiple modules, we'll want to stay DRY and code the middleware function in its own module.

```
touch config/ensureLoggedIn.js
```

We only want to export a single thing, a middleware function.  Thus, the best approach is to **assign** the function to `module.exports` as follows:

```js
// ensureLoggedIn.js

// Middleware for routes that require a logged in user
module.exports = function(req, res, next) {
  // Pass the req/res to the next middleware/route handler
  if ( req.isAuthenticated() ) return next();
  // Redirect to login if the user is not already logged in
  res.redirect('/auth/google');
}
```

Our custom `ensureLoggedIn` middleware function, like all middleware, will either call `next()`, or respond to the request.

### Using Authorization Middleware

Express's middleware and routing is extremely flexible and powerful.

We can add multiple middleware functions before a route's final middleware function!

Let's modify **routes/movies.js** to protect routes that require a logged in user using our new ensureLoggedIn middleware:

```js
// routes/movies.js

const moviesCtrl = require('../controllers/movies');
// Require the auth middleware
const ensureLoggedIn = require('../config/ensureLoggedIn');

router.get('/', moviesCtrl.index);
// Use ensureLoggedIn middleware to protect routes
router.get('/new', ensureLoggedIn, moviesCtrl.new);
router.get('/:id', moviesCtrl.show);
router.post('/', ensureLoggedIn, moviesCtrl.create);
```

Note the inserted `ensureLoggedIn` middleware function!

If the `ensureLoggedIn` middleware calls `next()`, then the next middleware, e.g., `moviesCtrl.new` will be called.

Test it out by logging out, and manually attempting to browse to `http://localhost:3000/movies/new`.  Very cool!

#### 👉 You Do - Protect More Routes (3 mins)

- Protect the **appropriate** routes in:
  - **routes/reviews.js**
  - **routes/performers.js**

<details>
<summary>
Solution
</summary>
<hr>

**routes/reviews.js**
```js
router.post('/movies/:id/reviews', ensureLoggedIn, reviewsCtrl.create);
router.delete('/reviews/:id', ensureLoggedIn, reviewsCtrl.delete);
```
**routes/performers.js**
```js
router.get('/performers/new', ensureLoggedIn, performersCtrl.new);
router.post('/performers', ensureLoggedIn, performersCtrl.create);
router.post('/movies/:movieId/performers', ensureLoggedIn, performersCtrl.addToCast)
```

<hr>
</details>

#### 👍 Congrats on implementing OAuth authentication and authorization!

Now you're ready to start your project and implement OAuth authentication before any other CRUD functionality.


<img src="https://i.imgur.com/wZrc2BM.png" width="60%">
 
## 9. 💪 Challenge Exercise (optional)

As an optional challenge exercise, use the [Guide to User-Centric CRUD using Express & Mongoose](https://gist.github.com/jim-clark/a714016bab26fad52106f6b2490e3eb7) to help you implement the following user story:

> AAU, I want to be able to update a review that I previously created.

## References

- [Google OAuth2](https://developers.google.com/identity/protocols/OAuth2)

- [Guide to User-Centric CRUD using Express & Mongoose](https://gist.github.com/jim-clark/a714016bab26fad52106f6b2490e3eb7)

- [Mongoose](http://mongoosejs.com/)
