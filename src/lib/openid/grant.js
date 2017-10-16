/**
 * Copyright (c) 2017, FinancialForce.com, inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 *   are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, 
 *      this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *      this list of conditions and the following disclaimer in the documentation 
 *      and/or other materials provided with the distribution.
 * - Neither the name of the FinancialForce.com, inc nor the names of its contributors 
 *      may be used to endorse or promote products derived from this software without 
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES 
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
 *  THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 *  OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/

'use strict';

/**
 * Used to get access tokens from the identity provider for a
 * user.
 * 
 * @module
 */

const
	sharedFunctions = require('./shared/functions'),
	issuer = require('./shared/issuer'),
	envValidator = require('./shared/envValidator'),

	validateUser = ({ env, user }) => {

		if (!user || user.username === '') {
			throw new Error('Invalid parameter: username cannot be empty.');
		}

		if (!user.username) {
			throw new Error('Missing required parameter: username.');
		}

		return { env, user };
	},

	getIssuer = ({ env, user }) => {
		return issuer.getAsync(env.openidHTTPTimeout, env.openidIssuerURI)
			.then(issuer => {
				if (issuer == null) {
					throw new Error( /* doesn't matter, catch assigns message */ );
				}
				return {
					env,
					issuerClient: new issuer.Client(),
					user
				};
			})
			.catch(() => {
				throw new Error(`Could not get an issuer for timeout: ${env.openidHTTPTimeout} and URI: ${env.openidIssuerURI}`);
			});
	},

	convertGrantToCredentials = (grant) => {
		return {
			instanceUrl: grant.instance_url,
			accessToken: grant.access_token
		};
	},

	fail = error => {
		throw new Error(`Failed to grant token, error: ${error.message}`);
	};

module.exports = {

	/**
	 * @typedef GetToken
	 * @type {function}
	 * @param {Object} user - The user.
	 * @param {string} user.username - The username.
	 */

	/**
	 * Returns a function that can obtain a token for the passed user.
	 * 
	 * @param {Object} env - The OpenID environment parameters
	 * @param {string} env.jwtSigningKey - The OpenID JWT signing private key.
	 * @param {string} env.openidClientId - The OpenID ClientID.
	 * @param {number} env.openidHTTPTimeout - The OpenID client HTTP timeout.
	 * @param {string} env.openidIssuerURI - The OpenID issuer URI.
	 * @return {GetToken} - The get token function.
	 */

	getToken: env => {
		envValidator.validate(env);
		return (user) => Promise.resolve({ env, user })
			.then(validateUser)
			.then(getIssuer)
			.then(sharedFunctions.constructSignedJwt)
			.then(sharedFunctions.obtainAuthorizationGrant)
			.then(convertGrantToCredentials)
			.catch(fail);
	}

};