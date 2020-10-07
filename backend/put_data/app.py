import json
import csv
import boto3


def lambda_handler(event, context):

    dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
    dbnames = ["Questions", "Topics"]
    csvfiles = ["questions_table_ke1_real.csv", "topic_table_ke1_real.csv"]

    for dbname, csvfile in zip(dbnames, csvfiles):
        table = dynamodb.Table(dbname)
        with open(csvfile) as f:
            reader = csv.DictReader(f)
            items = [dict(i) for i in list(reader)]
        # loop records, put to table
        with table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)
    return {"statusCode": 200, "body": json.dumps({"message": "jea buddi"})}


if __name__ == "__main__":

    palautus = lambda_handler({}, {})
    print(palautus)
