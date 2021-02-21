<?php
namespace {
	class QubiPay {
		const VERSION = '1.0';
		const BASE_URL = 'https://gateway.qubipay.io/api/v1';
		var $trusted_ip_list = array();
		var $test_mode = false;

		function __construct ($merchant_id, $secret) {
			$this->merchant_id = $merchant_id;
			$this->secret = $secret;
		}

		function createPayment ($options) {
			$options['amount'] = floatval($options['amount']);
			return $this->sendRequest('payments/create', $options);
		}

		function sendRequest ($path, $payload = null) {
			$path = self::BASE_URL.'/'.$path;
			if ($this->test_mode) {
				$path .= '?test';
			}

			if ($payload == null) {
				$response_raw = @file_get_contents($path);
			} else {
				$payload = json_encode($payload);
				$context  = stream_context_create(array(
					'http' => array(
						'method'  => 'POST',
						'header' => array(
							'Authorization: Basic '.base64_encode($this->merchant_id.':'.$this->secret),
							'Content-Type: application/json',
							'Content-Length: '.strlen($payload)
						),
						'user_agent' => 'QubiPay/'.self::VERSION.' PHP/'.phpversion().' ('.PHP_OS.'/'.php_uname('r').')',
						'content' => $payload,
						'ignore_errors' => true
					)
				));

				$response_raw = @file_get_contents($path, false, $context);
			}

			$http_prefix = isset($http_response_header) ? $http_response_header[0] : null;
			return new \QubiPay\ServerResponse($http_prefix, $response_raw);
		}
	}
}

namespace QubiPay {
	class ServerResponse {
		function __construct ($http_prefix, $response) {
			if ($response === false) {
				$this->success = false;
				$err = error_get_last();
				$this->message = $err['message'];
			} else {
				preg_match('%^HTTP/[0-9.]{3}\s([0-9]{3})%', $http_prefix, $response_code);
				$this->success = intval($response_code[1]) < 400;

				$response_json = json_decode($response, true);
				if ($response_json == null) {
					$this->message = $response;
				} else {
					$this->message = $response_json;
				}
			}
		}
	}
}
