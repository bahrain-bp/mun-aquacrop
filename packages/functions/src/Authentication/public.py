import json

def main(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "This is a public endpoint, accessible without authentication."
        }),
    }
