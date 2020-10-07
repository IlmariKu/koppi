import json
import uuid
import datetime
import boto3
from decimal import Decimal


def lambda_handler(event, context):
    def sm2(x: [int], a=6.0, b=-0.8, c=0.28, d=0.02, theta=0.2) -> float:
        """
        Modified from: https://gist.github.com/doctorpangloss/13ab29abd087dc1927475e560f876797

        The fractional days are also changed to date using datetime isoformat()

        Returns the number of days to delay the next review of an item by, fractionally, based on the history of answers x to
        a given question, where
        x == 0: Incorrect, Hardest  | "En muista"
        x == 1: Incorrect, Hard     |
        x == 2: Incorrect, Medium   | "Vaikea"
        x == 3: Correct, Medium     |
        x == 4: Correct, Easy       | "Hyvin"
        x == 5: Correct, Easiest    | "Helppo"
        @param x The history of answers in the above scoring.
        @param theta When larger, the delays for correct answers will increase.
        """

        assert all(0 <= x_i <= 5 for x_i in x)
        correct_x = [x_i >= 3 for x_i in x]
        # If you got the last question incorrect, just return 1
        if not correct_x[-1]:
            days = 1.0
        else:
            # Calculate the latest consecutive answer streak
            num_consecutively_correct = 0
            for correct in reversed(correct_x):
                if correct:
                    num_consecutively_correct += 1
                else:
                    break

            days = a * (
                max(1.3, 2.5 + sum(b + c * x_i + d * x_i * x_i for x_i in x))
            ) ** (theta * num_consecutively_correct)
        do_again_date = (
            datetime.datetime.utcnow() + datetime.timedelta(days=days)
        ).isoformat()
        return do_again_date

    def get_query_arguments(event):
        answer = {}
        if "body" in event:
            try:
                query = json.loads(event["body"])
                answer["Knowledge"] = query.get("Knowledge")
                answer["QuestionId"] = query.get("QuestionId")
                answer["UserId"] = query.get("UserId")
            except json.decoder.JSONDecodeError:
                print("Cant decode JSON from Body!")
        return answer

    def create_answer_id(answer):
        # AnswerId is composed of: userId_questionId
        answer_id = answer["UserId"] + "_" + answer["QuestionId"]
        return answer_id

    def update_knowledge_list(answer, new_knowledge):
        """
        Updates the knowledge list. 
        Arguments:
        - answer, dict
        Outputs:
        - knowledge_list, list of ints
        """
        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        answers_table = dynamodb.Table("Answers")

        try:
            response = answers_table.get_item(
                Key={"AnswerId": create_answer_id(answer)}
            )
            previous_answer = response["Item"]
            knowledge_list = previous_answer.get("KnowledgeList")
            knowledge_list.append(new_knowledge)

        except:
            # the answer is not necessarily in db before
            knowledge_list = [new_knowledge]

        knowledge_list = [int(i) for i in knowledge_list]

        return knowledge_list

    def put_item_to_answers_table(answer):
        # Primary
        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        answers_table = dynamodb.Table("Answers")

        updated_knowledge_list = update_knowledge_list(
            answer, new_knowledge=answer["Knowledge"]
        )

        answer_entry = {
            "AnswerId": create_answer_id(answer),
            "UserId": answer["UserId"],
            "Time": datetime.datetime.utcnow().isoformat(),
            "QuestionId": answer["QuestionId"],
            "do_again": sm2(updated_knowledge_list),
            "KnowledgeList": updated_knowledge_list,
        }

        answers_table.put_item(Item=answer_entry)

    def put_item_to_analytics_table(answer):
        """
        Stores item to analytics table. Where as answers table only retains the current state,
        analytics table has more stuff :)
        """
        # Primary
        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        analytics_table = dynamodb.Table("AnalyticsRe")

        anal_answer_entry = {
            "AnswerId": uuid.uuid4().hex,
            "UserId": answer["UserId"],
            "Time": datetime.datetime.utcnow().isoformat(),
            "QuestionId": answer["QuestionId"],
            "Knowledge": answer["Knowledge"],
        }

        analytics_table.put_item(Item=anal_answer_entry)

    answer = get_query_arguments(event)

    if None in answer.values() or not answer:
        print("Values are missing from answer-dict! Aborting")
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Credentials": "true",
                "Content-Type": "application/json",
            },
            "body": json.dumps({"message": "Invalid query! " + str(answer.items())}),
        }
    answer["Knowledge"] = int(answer["Knowledge"])
    put_item_to_answers_table(answer)
    put_item_to_analytics_table(answer)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
        },
        "body": json.dumps([{"message": "answer has been entered"}, answer]),
    }
