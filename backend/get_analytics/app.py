import json
import csv
import datetime
import dateutil

import boto3
from boto3.dynamodb.conditions import Key, Attr

# Everything is ugly as fuck. Info is relational - this is horribly inefficient and possibly unusably slow!
# Let's fix this later B)

def get_topic_of_answer(answer):
    """
    Given an answer_id, returns the topic as a dict
    Arguments:
    - answer (dict)
    Returns:
    - topic (dict)
    """
    question = get_entry_from_dynamo("Questions", "QuestionId", answer["QuestionId"])
    topic = get_entry_from_dynamo("Topics", "TopicId", question["TopicId"])
    return topic

def get_entry_from_dynamo(table_name, key, value):
    dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(Key={key: value})
        return response["Item"]
    except:
        print("No question found, returning None..")
        return None


def task_counter(user_id):
    """
    Sends
    """

    dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
    all_answers = (
        dynamodb.Table("AnalyticsRe")
        .scan(FilterExpression=Attr("UserId").eq(user_id))
        .get("Items")
    )
    date_count = {}
    for answer in all_answers:
        # print(answer)
        date = dateutil.parser.parse(answer["Time"]).date()
        if date not in date_count:
            date_count[date] = 0
        date_count[date] += 1
    # date_count_list = []
    # for i in sorted(date_count.keys()):
    #    date_count_list.append([date, date_count[date]])

    return date_count


def total_tasks_past_n_days(ndays, user_id):
    date_count = task_counter(user_id)
    tot = 0
    for date in date_count.keys():
        if (datetime.datetime.utcnow() - date) <= datetime.timedelta(days=ndays):
            tot += date_count[date]
    return tot


def tasks_per_day_past_n_days(ndays, user_id):
    date_count = task_counter(user_id)
    datecountlist = []
    for n in range(0, ndays):
        d = (datetime.datetime.utcnow() - datetime.timedelta(days=n)).date()
        if d in date_count:
            count = date_count[d]
        else:
            count = 0
        datecountlist.append([d.isoformat(), count])
    datecountlist = datecountlist[::-1]
    return datecountlist


def knowledge_state(user_id):
    """
    Returns a dict of {CourseName : [(TopicName, grade)] }

    """
    dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
    topic_table = dynamodb.Table("Topics")
    answer_table = dynamodb.Table("Answers")
    question_table = dynamodb.Table("Questions")

    answers = answer_table.scan(FilterExpression=Attr("UserId").eq(user_id)).get(
        "Items"
    )
    # nää kusee, kemia1 vrt Kemia1, mennää hardcodauksella..
    # courses = [i for i in response["Item"]["courses"]]
    courses = ["Kemia1"]
    knowledge_state_dict = {}
    for course in courses:
        topics = topic_table.scan(FilterExpression=Attr("Course").eq(course)).get(
            "Items"
        )
        for topic in topics:
            if topic["Course"] not in knowledge_state_dict:
                knowledge_state_dict[topic["Course"]] = {}

            questions = question_table.scan(
                FilterExpression=Attr("TopicId").eq(topic["TopicId"])
            ).get("Items")

            n_questions = len(questions) * 5.0
            numerator = 0
            # get all answers with those qids
            for q in questions:
                for a in answers:
                    if q["QuestionId"] == a["QuestionId"]:
                        if len(a["KnowledgeList"]) > 0:
                            knowledge = float(a["KnowledgeList"][-1])
                        else:
                            knowledge = 0.0
                        numerator += knowledge
            grade = numerator / n_questions
            knowledge_state_dict[course][topic["Topic"]] = grade

    return knowledge_state_dict


def get_skill(user_id):
    dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
    answer_table = dynamodb.Table("Answers")
    question_table = dynamodb.Table("Questions")

    answers = answer_table.scan(FilterExpression=Attr("UserId").eq(user_id)).get(
        "Items"
    )
    n_questions = len(question_table.scan().get("Items")) * 5.0

    numerator = 0
    for a in answers:
        if len(a["KnowledgeList"]) > 0:
            knowledge = float(a["KnowledgeList"][-1])
            weeks_since = (
                datetime.datetime.now() - dateutil.parser.parse(a["Time"])
            ).days / 7
            if weeks_since > knowledge:
                knowledge = 0
            else:
                knowledge -= weeks_since
        else:
            knowledge = 0
        numerator += knowledge
    grade = numerator / n_questions
    grade *= 100  # ilmari wants percent instead of fraction # i sure do!
    return round(grade)


def get_query_arguments(event):
    query = event.get("queryStringParameters")
    args = {}
    if query:
        args["UserId"] = query.get("UserId")
        args["Task"] = query.get("Task")
    return args


def lambda_handler(event, context):

    args = get_query_arguments(event)

    if args["Task"] == "KnowledgeState":
        response = {"KnowledgeState": knowledge_state(args["UserId"])}
        status_code = 200
    elif args["Task"] == "skill":
        response = {"skill": get_skill(args["UserId"])}
        status_code = 200
    elif args["Task"] == "task_history":
        dt = tasks_per_day_past_n_days(ndays=7, user_id=args["UserId"])
        lastday = dt[-1][-1]
        response = {"last_7_days": dt, "last_day": lastday}
        status_code = 200
    else:
        response = {"message": "Invalid query! " + str(args.items())}
        status_code = 400

    # returns analytics
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
        },
        "body": json.dumps(response),
    }

    # Read all user_id's answers from answers_table

    # filterexpression = Attr("UserId").eq(user_id)
    # response = answer_table.scan(FilterExpression=filterexpression)
    # items = response["Items"]


if __name__ == "__main__":
    for uid in "7e26332795983d24a2870b085f7be26a84ff16ca ei_oole".split():
        for task in "KnowledgeState skill task_history".split():
            event = {"queryStringParameters": {"UserId": uid, "Task": task}}
            palautus = lambda_handler(event, {})
            print(palautus)
