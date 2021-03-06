/*
 * Copyright (c) 2017-2019, FinancialForce.com, inc
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
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon, { SinonStub, SinonStubbedInstance } from 'sinon';
import sinonChai from 'sinon-chai';

import { AccessTokenResponse, Environment, GrantOptions, JwtGrantParams, SalesforceAccessTokenResponse, UserTokenGrantor } from '../../../src';
import * as cache from '../../../src/index/client/cache';
import { AuthClient } from '../../../src/index/client/oauth2';
import { OpenIdClient } from '../../../src/index/client/openid';
import * as validator from '../../../src/index/client/validator/environment';

import { getToken } from '../../../src/index/grant/grant';

const expect = chai.expect;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('index/grant/grant', () => {

	let env: Environment;
	let cacheStub: SinonStub<[Environment], Promise<AuthClient>>;
	let openIdClientStubInstance: SinonStubbedInstance<OpenIdClient>;

	beforeEach(() => {

		env = {
			httpTimeout: 4001,
			issuerURI: 'https://login.salesforce.com/',
			type: 'OpenID'
		};

		openIdClientStubInstance = sinon.createStubInstance(OpenIdClient);
		cacheStub = sinon.stub(cache, 'findOrCreateClient').resolves(openIdClientStubInstance);

		sinon.stub(validator, 'validate').returns(env);

	});

	afterEach(() => {
		sinon.restore();
	});

	it('should return a function when called with the app', () => {

		// Given
		// When
		const getUserCredentials = getToken(env);

		// Then
		expect(getUserCredentials).to.be.a('function');

		expect(validator.validate).to.have.been.calledOnce;
		expect(validator.validate).to.have.been.calledWithExactly(env);

	});

	describe('getUserCredentials', () => {

		let getUserCredentials: UserTokenGrantor;
		let params: JwtGrantParams;
		let opts: GrantOptions;

		beforeEach(() => {

			params = {
				clientId: 'testClientId',
				grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
				signingSecret: 'testSigningSecret',
				user: {
					username: 'test@test.com'
				}
			};

			opts = {
				decodeIdToken: false,
				verifySignature: false
			};

			getUserCredentials = getToken(env);

		});

		describe('should throw an error', () => {

			it('if user is missing', async () => {

				// Given
				delete params.user;

				// When
				// Then
				await expect(getUserCredentials(params)).to.eventually.be.rejectedWith('Failed to obtain grant for user. Caused by: Missing required object parameter: user');

			});

			it('if username is missing', async () => {

				// Given
				delete params.user.username;

				// When
				// Then
				await expect(getUserCredentials(params)).to.eventually.be.rejectedWith('Failed to obtain grant for user. Caused by: Missing required string parameter: user[username]');

			});

			it('if username is empty', async () => {

				// Given
				params.user.username = '';

				// When
				// Then
				await expect(getUserCredentials(params)).to.eventually.be.rejectedWith('Failed to obtain grant for user. Caused by: Invalid parameter: user[username] cannot be empty');

			});

			it('if findOrCreateClient rejects', async () => {

				// Given
				cacheStub.rejects(new Error('something or other'));

				// When
				await expect(getUserCredentials(params)).to.eventually.be.rejectedWith('Failed to obtain grant for user (test@test.com). Caused by: something or other');

				// Then
				expect(cache.findOrCreateClient).to.have.been.calledOnce;
				expect(cache.findOrCreateClient).to.have.been.calledWith(env);

			});

			it('if obtainAuthorizationGrant rejects', async () => {

				// Given
				openIdClientStubInstance.grant.throws(new Error('something or other'));

				// When
				await expect(getUserCredentials(params, opts)).to.eventually.be.rejectedWith('Failed to obtain grant for user (test@test.com). Caused by: something or other');

				// Then
				expect(cache.findOrCreateClient).to.have.been.calledOnce;
				expect(cache.findOrCreateClient).to.have.been.calledWith(env);
				expect(openIdClientStubInstance.grant).to.have.been.calledWith({
					clientId: 'testClientId',
					grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
					signingSecret: 'testSigningSecret',
					user: {
						username: 'test@test.com'
					}
				}, { decodeIdToken: false, verifySignature: false });

			});

		});

		describe('should obtain the grant', () => {

			it('for a salesforce access token response', async () => {

				// Given
				const token: SalesforceAccessTokenResponse = {
					access_token: '00Dxx0000001gPL!AR8AQJXg5oj8jXSgxJfA0lBog.39AsX.LVpxezPwuX5VAIrrbbHMuol7GQxnMeYMN7cj8EoWr78nt1u44zU31IbYNNJguseu',
					id: 'https://login.salesforce.com/id/00Dxx0000001gPLEAY/005xx000001SwiUAAS',
					instance_url: 'https:// yourInstance.salesforce.com',
					issued_at: '1551531242643',
					scope: 'web openid api id',
					signature: 'd4A6A67xJuzK4iYucL/EsnC/caaWl0aUfs1a8aSFAMw=',
					token_type: 'Bearer',
					userInfo: {
						id: '005xx000001SwiUAAS',
						organizationId: '00Dxx0000001gPLEAY',
						url: 'https://login.salesforce.com/id/00Dxx0000001gPLEAY/005xx000001SwiUAAS',
						validated: true
					}
				};

				openIdClientStubInstance.grant.resolves(token);

				// When
				const userCredentials = await getUserCredentials(params, opts);

				// Then
				expect(userCredentials).to.eql({
					accessToken: '00Dxx0000001gPL!AR8AQJXg5oj8jXSgxJfA0lBog.39AsX.LVpxezPwuX5VAIrrbbHMuol7GQxnMeYMN7cj8EoWr78nt1u44zU31IbYNNJguseu',
					instanceUrl: 'https:// yourInstance.salesforce.com',
					userInfo: {
						id: '005xx000001SwiUAAS',
						organizationId: '00Dxx0000001gPLEAY',
						url: 'https://login.salesforce.com/id/00Dxx0000001gPLEAY/005xx000001SwiUAAS',
						validated: true
					}
				});

				expect(cache.findOrCreateClient).to.have.been.calledOnce;
				expect(cache.findOrCreateClient).to.have.been.calledWith(env);
				expect(openIdClientStubInstance.grant).to.have.been.calledWith({
					clientId: 'testClientId',
					grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
					signingSecret: 'testSigningSecret',
					user: {
						username: 'test@test.com'
					}
				}, { decodeIdToken: false, verifySignature: false });

			});

			it('for an access token response', async () => {

				// Given
				const token: AccessTokenResponse = {
					access_token: '00Dxx0000001gPL!AR8AQJXg5oj8jXSgxJfA0lBog.39AsX.LVpxezPwuX5VAIrrbbHMuol7GQxnMeYMN7cj8EoWr78nt1u44zU31IbYNNJguseu',
					scope: 'web openid api id',
					token_type: 'Bearer'
				};

				openIdClientStubInstance.grant.resolves(token);

				// When
				const userCredentials = await getUserCredentials(params, opts);

				// Then
				expect(userCredentials).to.eql({
					accessToken: '00Dxx0000001gPL!AR8AQJXg5oj8jXSgxJfA0lBog.39AsX.LVpxezPwuX5VAIrrbbHMuol7GQxnMeYMN7cj8EoWr78nt1u44zU31IbYNNJguseu'
				});

				expect(cache.findOrCreateClient).to.have.been.calledOnce;
				expect(cache.findOrCreateClient).to.have.been.calledWith(env);
				expect(openIdClientStubInstance.grant).to.have.been.calledWith({
					clientId: 'testClientId',
					grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
					signingSecret: 'testSigningSecret',
					user: {
						username: 'test@test.com'
					}
				}, { decodeIdToken: false, verifySignature: false });

			});

		});

	});

});
