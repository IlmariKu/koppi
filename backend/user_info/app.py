import json

def lambda_handler(event, context):

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "im returning user info here, like courses"
        }),
    }
