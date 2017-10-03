# Nozomi Authentication.

Nozomi authentication is [Express](http://expressjs.com/)-compatible authentication
middleware for [Node.js](http://nodejs.org/). It is aimed at users of the [Nozomi]() framework, but can also be used standalone. It is aimed at users of the Salesforce Identity Provider.

## Install

```
$ npm install @financialforcedev/nozomi-auth
```

## Usage

### Middleware

Multiple middleware functions are available.

#### Token Validator

The token validator middleware checks that a valid OpenID Connect Bearer token exists in an **Authorization** HTTP header. It does this by calling the specified Identity Provider's UserInfo endpoint with the Bearer token.

If the token is successfully validated then a *user* object is set on the request's *nozomi* object.

Failure messages are emitted on the *emitter*.

```javascript

const
	middleware = require('@financialforcedev/nozomi-auth').middleware,
	env = {
		jwtSigningKey: '--SOME KEY MATERIAL--',
		openidClientId: '12312312413-7236762374',
		openidHTTPTimeout: 4000,
		openidIssuerURI: 'https://login.salesforce.com'
	};

app.use(middleware.tokenValidator(env));

middleware.emitter.on('denied', (message) => {
	console.log(message);
});
middleware.emitter.on('token_validated', (message) => {
	console.log(message);
});


```

The *user* object contains the following fields.

```json

{
	"username": "someuser@someorg.something",
	"organizationId": "00D80000000bSxXEAU"
}

```

#### Grant Checker

The grant checker is designed to be used in tandem with the token Validator. It uses the *user* object on the request's *nozomi* object and attempts to obtain an OpenID Connect access token using a JWT Bearer grant request. In order for this to work the Identity Provider must have a previously established authorisation for the user requested. With the Salesforce identity provider this is achieved using a Connected App and an uploaded Certificate.

If this completes successfully it sets the *nozomi.grantChecked* property to be true, otherwise the user will be refused access.

Failure messages are emitted on the *emitter*.

```javascript

const
	middleware = require('@financialforcedev/nozomi-auth').middleware,
	env = {
		jwtSigningKey: '--SOME KEY MATERIAL--',
		openidClientId: '12312312413-7236762374',
		openidHTTPTimeout: 4000,
		openidIssuerURI: 'https://login.salesforce.com'
	};


app.use(middleware.grantChecker(env));

middleware.emitter.on('denied', (message) => {
    console.log(message);
});
middleware.emitter.on('grant_checked', (message) => {
	console.log(message);
});


```

### Token Granter

This can be called at any time to obtain credentials to connect to Salesforce. This depends on the configuration of a Connected App in your Salesforce org, with pre-authorized users connected via a Permission Set to it and a certificate uploaded that corresponds to the *jwtSigningKey*.

The credentials returned are in a form suitable to be used with [JSforce](https://jsforce.github.io/). See the example below.

```javascript

const
	grant = require('@financialforcedev/nozomi-auth').grant,
	jsforce = require('jsforce'),
	env = {
		jwtSigningKey: '--SOME KEY MATERIAL--',
		openidClientId: '12312312413-7236762374',
		openidHTTPTimeout: 4000,
		openidIssuerURI: 'https://login.salesforce.com'
	},
	user = {
		username: 'someuser@someorg.something',
		organizationId: '00D80000000bSxXEAU'
	},
	getToken = grant.getToken(env);
	getJsforceConnection = (credentials) => {
		return new jsforce.Connection(credentials);
	},
	getLimits = (conn) => {
		return Promise.all([conn, conn.limits()]);
	},
	displayLimits = ([conn, limits]) => {
		console.log(limits);
		return conn;
	},
	logout = (conn) => {
		return conn.logout();
	};


getToken(user)
	.then(getJsforceConnection)
	.then(getLimits)
	.then(displayLimits)
	.then(logout);

```