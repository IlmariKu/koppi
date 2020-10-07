import json
import random
import boto3
from boto3.dynamodb.conditions import Key, Attr
import datetime

dummyquestions = [
    {
        "Answer": "Ihan vitusti, Atomi pt 0!",
        "Difficulty": "1",
        "QuestionId": "1_0",
        "QuestionText": "Atomi on...",
        "TopicId": "1",
        "Type": "flashcard",
    },
    {
        "Answer": "Ihan vitusti, Atomi pt 1!",
        "Difficulty": "2",
        "QuestionId": "1_1",
        "QuestionText": "Atomi ei ole...",
        "TopicId": "1",
        "Type": "flashcard",
    },
]


def lambda_handler(event, context):

    """
    This function delivers a list of questions (questionList) for the student to study next.

    It takes in an event["queryStringParameters"] dict with the following keys:
    - excludeIds: 
        - List of QuestionIds that are to be exluded when getting new questions
        - Reason for exlusion is that those questions are already in questionList of the user
    - UserId : str 
    - Course : str


    
    """

    def get_query_arguments(event):
        query = event.get("queryStringParameters")
        args = {}
        if query:
            if query.get("excludeIds"):
                args["excludeIds"] = query["excludeIds"]
            else:
                args["excludeIds"] = []
            args["UserId"] = query.get("userId")
            args["Course"] = query.get("course")
        return args

    ## not needed..
    # def get_topic_of_answer(answer):
    #     """
    #     Given an answer_id, returns the topic as a dict
    #     Arguments:
    #     - answer (dict)
    #     Returns:
    #     - topic (dict)
    #     """
    #     question = get_question_of_answer(answer)
    #     topic = get_topic_of_question(question)
    #     return topic

    def get_topic_of_question(question):
        """
        Given an question, return the topic as dict
        Arguments:
        - question (dict)
        Returns:
        - question (dict)
        """
        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        topic_table = dynamodb.Table("Topics")

        topic_id = question.get("TopicId")
        # query topic_id of the question
        try:
            response = topic_table.get_item(Key={"TopicId": topic_id})
            topic = response["Item"]
        except:
            print("No topic found, returning None..")
            return None
        return topic

    def get_question_of_answer(answer):
        """
        Given an answer, return the topic as dict
        Arguments:
        - answer (dict)
        Returns:
        - question (dict)
        """
        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        question_table = dynamodb.Table("Questions")

        question_id = answer.get("QuestionId")
        # query topic_id of the question
        try:
            response = question_table.get_item(Key={"QuestionId": question_id})
            question = response["Item"]
        except:
            print("No question found, returning None..")
            return None
        return question

    def get_user_answers(user_id):
        """
        Returns the answers of a user.
        Arguments:
        - user_id (str)
        Returns:
        - answers (list of dicts)
        """
        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        answer_table = dynamodb.Table("Answers")

        filterexpression = Attr("UserId").eq(user_id)
        response = answer_table.scan(FilterExpression=filterexpression)
        answers = response.get("Items")

        return answers

    def choose_questions_to_rehearse(answers, exclude_ids):

        """
        Chooses questions that should be rehearsed
        Arguments:
        - answers: list of dicts
        - exclude_ids: list of question_ids to ignore
        Returns:
        - questionList: list of dicts 
        """

        def gt(dt_str):
            # converts datetime string to datetime object...
            # https://stackoverflow.com/a/28332149
            dt, _, us = dt_str.partition(".")
            dt = datetime.datetime.strptime(dt, "%Y-%m-%dT%H:%M:%S")
            us = int(us.rstrip("Z"), 10)
            return dt + datetime.timedelta(microseconds=us)

        # Choose questions to rehearse
        questionList = []
        for answer in answers:
            # ignore those in exclude_ids
            if answer["QuestionId"] in exclude_ids:
                continue
            # check if its time to rehearse!
            if "do_again" in answer:
                now = datetime.datetime.utcnow()
                do_again_datetime = gt(answer["do_again"])
                if do_again_datetime <= now:
                    do_again = True
                else:
                    do_again = False
            else:
                do_again = False  # tyhmää debuggausta. jollain entryilla puuttuu, siks kai kusee

            # if time to rehearse
            # OR
            # KnowledgeList is [] meaning that question hasn't been checked yet
            if do_again or answer.get("KnowledgeList") == []:
                question = get_question_of_answer(answer)
                questionList.append(question)
        return questionList

    def get_questions_of_topic(topic):
        """
        Returns questions related to a topic

        Arguments:
        - topic, dict
        Returns:
        - questionList, list of dicts
        """

        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        question_table = dynamodb.Table("Questions")

        fe = Attr("TopicId").eq(topic.get("TopicId"))
        response = question_table.scan(FilterExpression=fe)
        questions = response.get("Items")
        return questions

    def determine_next_topic(max_topic_order, course):
        """
        Determine the next topic
        Arguments:
        - max_topic_order: int of previous max topic order
        - course: str, coursename eg Kemia1
        Returns:
        - next topic_id
        """

        # get all topics

        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        topic_table = dynamodb.Table("Topics")

        # max_topic_order can be None if no course started yet.
        # Return the topic with lowest topic order
        if not max_topic_order:
            response = topic_table.scan(FilterExpression=Attr("Course").eq(course))
            all_topics = response.get("Items")
            next_topic = min(all_topics, key=lambda d: d["TopicOrder"])
        else:
            fe = Attr("TopicOrder").gt(max_topic_order) & Attr("Course").eq(course)
            response = topic_table.scan(FilterExpression=fe)
            topics = response.get("Items")

            if topics:
                # https://stackoverflow.com/questions/30546889/get-max-value-index-for-a-list-of-dicts
                next_topic = min(topics, key=lambda d: d["TopicOrder"])
            else:
                # If the current topic is already the last one, return a random one
                # TODO
                # Calculate topif for which the knowledge is worse. Give those problems.
                #
                response = topic_table.scan(FilterExpression=Attr("Course").eq(course))
                all_topics = response.get("Items")
                next_topic = random.sample(population=all_topics, k=1)

        return next_topic

    def put_new_questions_to_answers_table(questionList, user_id):
        """
        Takes in a list of questions, the user_id, and populated answer_table
        with new questions for the user

        Arguments:
        - questionList: list of dicts, questions
        - user_id: str, user_id        
        """

        # Put questions to answers_table
        dynamodb = boto3.resource("dynamodb", region_name="eu-central-1")
        answer_table = dynamodb.Table("Answers")

        now = datetime.datetime.utcnow().isoformat()
        with answer_table.batch_writer() as batch:
            for question in questionList:
                answer_to_add = {
                    "UserId": user_id,
                    "AnswerId": "{}_{}".format(user_id, question["QuestionId"]),
                    "QuestionId": question["QuestionId"],
                    "Time": now,
                    "do_again": datetime.datetime.utcnow().isoformat(),
                    "KnowledgeList": [],
                }
                batch.put_item(Item=answer_to_add)

    args = get_query_arguments(event)
    if None in args.values() or not args:
        print("Values are missing from answer-dict! Aborting")
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Credentials": "true",
                "Content-Type": "application/json",
            },
            "body": json.dumps({"message": "Invalid query! " + str(args.items())}),
        }

    # Get users answers from answers_table
    old_answers_of_user = get_user_answers(args["UserId"])
    questionList = choose_questions_to_rehearse(old_answers_of_user, args["excludeIds"])

    if len(questionList) <= 5:
        topic_orders = [
            get_topic_of_question(question).get("TopicOrder")
            for question in questionList
        ]
        # this should be done in a cleaner way xD
        if topic_orders:
            max_topic_order = max(topic_orders)
        else:
            max_topic_order = None  # determine next topic deals with None!
        next_topic = determine_next_topic(max_topic_order, args["Course"])
        new_questions = get_questions_of_topic(next_topic)
        if args["UserId"] != "unknown":
            put_new_questions_to_answers_table(new_questions, args["UserId"])

        # Add the new questions to question list
        questionList += new_questions

    # returns questions to recap
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
        },
        "body": json.dumps(questionList),
    }


if __name__ == "__main__":
    event = {
        "queryStringParameters": {
            "excludeIds": "1 2 3 4 5 6 7 8 9 10".split(),
            "UserId": "shitman_tough",
            "Course": "Kemia1",
        }
    }
    palautus = lambda_handler(event, {})
    print(palautus)
