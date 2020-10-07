import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import styled from "styled-components";
import { Answer } from "./Answer.jsx";

export function Flashcard(props) {
  // 0 Dont remember
  // 2 Hard
  // 4 Good
  // 5 Perfect
  const answers = [5, 4, 2, 0].map(function (level) {
    return (
      <Answer
        key={level}
        addPoints={props.addPoints}
        sendAnswer={props.sendAnswer}
        questionId={props.questionId}
        level={level}
      />
    );
  });

  return (
    <Container style={{"minHeight": "100%", "height": "100%", "overflow": "hidden"}}>
      <Row>
        <Col />
        <Col>
          <TaskType>Muistitehtävä</TaskType>
        </Col>
        <Col />
      </Row>
      <Row style={{ height: "5vh" }}></Row>
      <Row style={{height: "50vh", overflow: "hidden"}}>
        <Col>
          {props.answered ? (
            <Question>{props.answer}</Question>
          ) : (
            <Question>{props.text}</Question>
          )}
        </Col>
      </Row>
      {props.answered ? (
        <div>
          {answers}
        </div>
      ) : (
        <Row className="navbar fixed-bottom">
          <Col></Col>
          <Col xs={12} lg={6}>
            <ShowAnswer onClick={() => props.setAnswered(true)}>
              Näytä vastaus
            </ShowAnswer>
          </Col>
          <Col></Col>
        </Row>
      )}
    </Container>
  );
}

const TaskType = styled.div`
  font-size: 3.5em;
`;

const Question = styled.div`
  font-size: 3em;
  text-align: center;
  overflow: hidden;
`;

const ShowAnswer = styled.div`
  font-size: 10vh;
  text-align: center;
  border: solid;
  border-radius: 15px;
  cursor: pointer;
`;
