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

import * as index from '../src';

const expect = chai.expect;

describe('index', () => {

	it('should contain the correct parts', () => {

		// Given
		// When
		// Then
		expect(index).to.have.keys([
			'EVENT_AUTHORIZATION_HEADER_SET',
			'EVENT_DENIED',
			'EVENT_GRANT_CHECKED',
			'EVENT_TOKEN_INTROSPECTED',
			'EVENT_TOKEN_VALIDATED',
			'EVENT_USER_IDENTITY_RETRIEVED',
			'ResponseFormat',
			'flow',
			'grant',
			'introspection',
			'middleware',
			'openIdClient',
			'revocation',
			'userInfo'
		]);

		expect(index.flow).to.have.keys([
			'jwtBearerToken',
			'refreshToken',
			'webServer'
		]);

		expect(index.grant).to.have.keys([
			'getToken'
		]);

		expect(index.introspection).to.have.keys([
			'createTokenIntrospector'
		]);

		expect(index.middleware).to.have.keys([
			'authCallback',
			'grantChecker',
			'retrieveIdentityInformation',
			'tokenIntrospection',
			'tokenValidator'
		]);

		expect(index.openIdClient).to.have.keys([
			'clearCache'
		]);

		expect(index.revocation).to.have.keys([
			'createTokenRevoker'
		]);

		expect(index.userInfo).to.have.keys([
			'createUserInfoRequester'
		]);

	});

});
