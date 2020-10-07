import boto3
import datetime


def lambda_handler(event, context):
    dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
    table = dynamodb.Table("Users")
    email = event["request"]["userAttributes"]["email"]
    user_id = event["request"]["userAttributes"]["custom:user_id"]

    table.put_item(
        Item={
            "UserId": user_id,
            "email": email,
            "registered_on": datetime.datetime.utcnow().isoformat(),
            "courses": ["Kemia1"],
        }
    )
    event["response"]["autoConfirmUser"] = True
    return event
