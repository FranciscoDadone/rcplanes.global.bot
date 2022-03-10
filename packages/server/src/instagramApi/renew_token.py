from defines import getCreds, makeApiCall

def renew_access_token() :
	""" Get long lived access token
	
	API Endpoint:
		https://graph.facebook.com/{graph-api-version}/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={your-access-token}
	Returns:
		object: data from the endpoint
	"""

	params = getCreds()

	endpointParams = dict() # parameter to send to the endpoint
	endpointParams['grant_type'] = 'fb_exchange_token'
	endpointParams['client_id'] = params['client_id']
	endpointParams['client_secret'] = params['client_secret']
	endpointParams['fb_exchange_token'] = params['access_token']

	url = params['endpoint_base'] + 'oauth/access_token'

	api_call = makeApiCall( url, endpointParams, params['debug'] )['json_data']

	print(api_call)

	return api_call['access_token']

new_token = renew_access_token();

f = open('private/access_token.txt', 'w')
f.write(new_token)