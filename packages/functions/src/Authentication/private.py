import json

def main(event, context):
    # Extract user claims from the request context
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims')

    # Check if claims are present
    if not claims:
        return {
            'statusCode': 401,
            'body': json.dumps({'message': 'Unauthorized'})
        }

    # Extract specific user information from claims
    phone_number = claims.get('phone_number')
    user_id = claims.get('sub')  # User's unique identifier (UUID)

    # Construct the response
    response = {
        'message': 'Access to private endpoint granted.',
        'user': {
            'id': user_id,
            'phone': phone_number,
        },
    }

    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
