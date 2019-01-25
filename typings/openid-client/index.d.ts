/**
 * Copyright (c) 2018-2019, FinancialForce.com, inc
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

declare module 'openid-client' {

	interface Constructable<T> {
		new(): T;
	}

	export class Issuer {

		public static defaultHttpOptions: {
			timeout: number;
		};

		public static discover: (openidIssuerUri: string) => Promise<Issuer>;

		public authorization_endpoint: string;
		public revocation_endpoint: string;
		public token_endpoint: string;

		public grant: () => string;

		public Client: Constructable<Client>;

	}

	export class Client {

		constructor(options: any);

		public grant({ grant_type, assertion }: { grant_type: string, assertion: string }): Promise<OpenIdGrant>;

		public userinfo(accessToken: string, options?: any): Promise<UserInfo>;

	}

	/**
	 * OpenID Success Response
	 * 
	 * As defined in https://openid.net/specs/openid-connect-core-1_0.html#ImplicitAuthResponse.
	 */
	interface OpenIdGrant {

		/**
		 * OAuth 2.0 Access Token.
		 */
		access_token: string;

		/**
		 * Expiration time of the Access Token in seconds since the response was generated.
		 */
		expires_in: number;

		/**
		 * ID Token.
		 */
		id_token: string;

		/**
		 * OAuth 2.0 state value.
		 */
		state?: string;

		/** 
		 * OAuth 2.0 Token Type value.
		 */
		token_type: string;

		// Optional Salesforce related properties in their response.

		/**
		 * Identity URL that can be used to both identify the user and query for more information about the user in Salesforce.
		 */
		id?: string;

		/**
		 * A URL indicating the instance of the user’s Salesforce org.
		 */
		instance_url?: string;

	}

	interface UserInfo {
		preferred_username: string;
		organization_id: string;
	}

}
