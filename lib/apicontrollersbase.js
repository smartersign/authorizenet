'use strict';

const axios = require('axios');
const logger = require('./logger.js').logger;
const config = require('./config').config;
const constants = require('./constants').constants;

class APIOperationBase {
	constructor(apiRequest) {
		logger.debug('Enter APIOperationBase constructor');

		this._request = null;
		this._response = null;
		this._endpoint = constants.endpoint.sandbox;

		if (null == apiRequest)
			logger.error('Input request cannot be null');

		this._request = apiRequest;

		logger.debug('Exit APIOperationBase constructor');
	}

	// abstract
	validateRequest() {
		return;
	}

	validate() {
		return;
	}

	getResponse() {
		return this._response;
	}

	getResultcode() {
		let resultcode = null;

		if (this._response)
			resultcode = this._response.resultCode;

		return resultcode;
	}

	getMessagetype() {
		let message = null;

		if (this._response) {
			message = this._response.message;
		}

		return message;
	}

	beforeExecute() {}

	setClientId() {
		for (let obj in this._request) {
			this._request[obj]['clientId'] = config.clientId;
			break;
		}
	}

	setEnvironment(env) {
		this._endpoint = env;
	}

	async execute(callback) {
		logger.debug('Enter APIOperationBase execute');

		logger.debug('Endpoint: ' + this._endpoint);

		this.beforeExecute();

		this.setClientId();

		logger.debug(JSON.stringify(this._request, null, 2));

		const reqOpts = {
			url: this._endpoint,
			method: 'POST',
			timeout: config.timeout,
			data: this._request,
			headers: {
				'Content-Type': 'application/json'
			},
			proxy: config.proxy.setProxy ? {
				host: config.proxy.proxyUrl
			} : false
		};

		try {
			const response = await axios(reqOpts);
			if (response.data) {
				const responseObj = JSON.parse(response.data.slice(1));
				logger.debug(JSON.stringify(responseObj, null, 2));
				this._response = responseObj;
				callback();
			} else {
				logger.error('Undefined Response');
			}
		} catch (error) {
			logger.error(error);
		}

		logger.debug('Exit APIOperationBase execute');
	}
}

module.exports.APIOperationBase = APIOperationBase;
