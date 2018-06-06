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

const
	jsonwebtoken = require('jsonwebtoken'),

	JWT_GRANT_TYPE = 'grant_type',
	JWT_BEARER_GRANT = 'urn:ietf:params:oauth:grant-type:jwt-bearer',
	RSA_256 = 'RS256',
	RSA_256_ALGORITHM = { algorithm: RSA_256 },

	constructSignedJwt = ({ env, issuerClient, user }) => {
		const
			nowPlusFourMinutes = () => {
				return Math.floor(Date.now() / 1000) + (60 * 4);
			},
			payload = {
				iss: env.openidClientId,
				aud: env.openidIssuerURI,
				sub: user.username,
				exp: nowPlusFourMinutes()
			},
			createAssertion = new Promise(resolve => {
				jsonwebtoken.sign(payload, env.jwtSigningKey, RSA_256_ALGORITHM, (err, token) => {
					if (token) {
						resolve(token);
					} else {
						throw new Error('Failed to sign authentication token');
					}
				});
			});

		return createAssertion
			.then(assertion => ({
				issuerClient,
				assertion
			}));
	},

	obtainAuthorizationGrant = ({ issuerClient, assertion }) => {
		return issuerClient.grant({
			[JWT_GRANT_TYPE]: JWT_BEARER_GRANT,
			assertion: assertion
		}).then(grant => {
			if (grant == null) {
				throw new Error('No grant received.');
			}
			return grant;
		}).catch((error) => {
			throw new Error('Grant request failed: ' + error.message);
		});
	};

module.exports = {
	constructSignedJwt,
	obtainAuthorizationGrant
};
