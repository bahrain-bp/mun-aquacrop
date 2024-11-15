import json
import random
import boto3

# Initialize the SNS client outside the handler for performance optimization
sns_client = boto3.client('sns')

def lambda_handler(event, context):
    if event['triggerSource'] == "DefineAuthChallenge_Authentication":
        # Define the custom challenge flow
        if len(event['request']['session']) == 0:
            # New login attempt - create a custom challenge
            event['response']['challengeName'] = "CUSTOM_CHALLENGE"
            event['response']['issueTokens'] = False
            event['response']['failAuthentication'] = False
        elif any(
            challenge['challengeName'] == "CUSTOM_CHALLENGE" and challenge['challengeResult'] is True
            for challenge in event['request']['session']
        ):
            # If the OTP was successful, issue tokens
            event['response']['issueTokens'] = True
            event['response']['failAuthentication'] = False
        else:
            # If OTP failed, continue the challenge
            event['response']['issueTokens'] = False
            event['response']['failAuthentication'] = True

    elif event['triggerSource'] == "CreateAuthChallenge":
        # Generate a 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Get the user's phone number from the event object
        phone_number = event['request']['userAttributes']['phone_number']
        
        # Send the OTP via SMS using SNS
        sns_client.publish(
            PhoneNumber=phone_number,
            Message=f"Your OTP code is {otp}"
        )
        
        # Save the OTP in privateChallengeParameters for later verification
        event['response']['privateChallengeParameters'] = {'otp': otp}
        event['response']['challengeMetadata'] = "CUSTOM_CHALLENGE"

    elif event['triggerSource'] == "VerifyAuthChallengeResponse":
        # Verify if the provided OTP matches the generated OTP
        expected_otp = event['request']['privateChallengeParameters'].get('otp')
        if event['request']['challengeAnswer'] == expected_otp:
            event['response']['answerCorrect'] = True
        else:
            event['response']['answerCorrect'] = False

    return event
