import React, { useState, useEffect } from "react";
import { Flashcard } from "./Cards/Flashcard.jsx";
import { ReachedEnd } from "./Cards/ReachedEnd.jsx";
import styled from "styled-components";
import Spinner from "react-bootstrap/Spinner";

const send_answer_url =
  "https://f51gpjbn08.execute-api.eu-central-1.amazonaws.com/send_answer";

const QUESTION_LIMIT = 10;

export function TaskMain(props) {
  const [answered, setAnswered] = useState(true);
  const [questionText, setText] = useState("");
  const [questionType, setType] = useState("");
  const [questionAnswer, setAnswer] = useState("");
  const [questionId, setId] = useState("");
  const [fetching, setFetching] = useState(false);
  const [firstUserEnd, setFirstUserEnd] = useState(false);
  const [allQuestions, updateAllQuestions] = useState([]);

  function createGetQuestionsUrl(questions, course, userId) {
    let base_url = `https://f51gpjbn08.execute-api.eu-central-1.amazonaws.com/get_questions`;
    if (!userId) {
      userId = "unknown";
    }
    const url = `${base_url}?userId=${userId}&course=${course}&`;
    let query = "";
    questions.forEach(function (question) {
      query += `excludeIds=${question["QuestionId"]}&`;
    });
    if (query !== "") {
      return url + query.slice(0, -1);
    }
    return url;
  }

  function getQuestions(first = false) {
    (async () => {
      if (!first && (allQuestions.length > QUESTION_LIMIT || fetching)) {
        return;
      }
      setFetching(true);
      const get_questions_url = createGetQuestionsUrl(
        allQuestions,
        props.course,
        props.userId
      );
      const rawResponse = await fetch(get_questions_url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (first || allQuestions.length === 0) {
        setNewQuestion(content.shift());
      }
      if (allQuestions.length < QUESTION_LIMIT){
        updateAllQuestions(allQuestions.concat(content));
      } else {
        updateAllQuestions(content);
      }
      setFetching(false);
    })();
  }

  function sendAnswerToAPI(answer, questionId, user_id) {
    props.getAnalytics(user_id)
    getQuestions();
    (async () => {
      const rawResponse = await fetch(send_answer_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Knowledge: answer,
          QuestionId: questionId,
          UserId: user_id,
        }),
      });
      await rawResponse.json();
    })();
  }

  function setNewQuestion(question) {
    setText(question["QuestionText"]);
    setType(question["Type"]);
    setAnswer(question["Answer"]);
    setId(question["QuestionId"]);
    setAnswered(false);
  }

  function setMockQuestion(question) {
    setText("Kysymys");
    setType("flashcard");
    setAnswer("vastaus");
    setId();
    setAnswered(false);
  }

  function emptyQuestion() {
    setText("");
    setType("");
    setAnswer("");
    setId("");
    setAnswered(false);
  }

  function grabNextQuestion() {
    if (allQuestions.length === 0) {
      if (props.userId === "") {
        // Show end-screen if user not logged-in
        setFirstUserEnd(true);
        emptyQuestion();
        ga("send", "event", "cards", "reachedEnd");
        return;
      }
      // User is logged in, but no questions, give him loading screen
      setFirstUserEnd(false);
      emptyQuestion();
    }
    setNewQuestion(allQuestions.shift());
  }

  function sendAnswer(level, questionId) {
    if (props.userId !== "") {
      sendAnswerToAPI(level, questionId, props.userId);
      ga("send", "event", "cards", "registered_answer_sent");
    } else {
      ga("send", "event", "cards", "unregistered_answer_sent");
    }
    grabNextQuestion();
  }

  useEffect(() => {
    setMockQuestion()
    //updateAllQuestions([]);
    //props.getAnalytics(props.userId)
    //emptyQuestion();
    //getQuestions(true);
  }, [props.userId]);

  return (
    <div>
      {firstUserEnd && props.userId === "" ? (
        <ReachedEnd setModal={props.setModal} />
      ) : questionText !== "" &&
        (questionType === "flashcard" || "OpenEnded") ? (
        <Flashcard
          text={questionText}
          answer={questionAnswer}
          sendAnswer={sendAnswer}
          questionId={questionId}
          answered={answered}
          setAnswered={setAnswered}
        />
      ) : (
        <SpinnerArea>
          <Spinner style={{ marginTop: "250px" }} size="lg" animation="grow" />
        </SpinnerArea>
      )}
    </div>
  );
}

const SpinnerArea = styled.div`
  text-align: center;
  height: 500px;
  width: 100%;
`;
