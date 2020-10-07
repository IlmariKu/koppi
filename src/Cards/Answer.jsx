import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import styled from "styled-components";

export function Answer(props) {
  function getDifficultyText(level) {
    const difficulties = {
      5: "Helppo",
      4: "Hyvin",
      2: "Vaikea",
      0: "En muista",
    };
    return difficulties[level];
  }

  return (
    <Row>
      <Col xs={1}></Col>
      <Col xs={10}>
        <AnswerButton
          onClick={() => props.sendAnswer(props.level, props.questionId)}
        >
          {getDifficultyText(props.level)}
        </AnswerButton>
      </Col>
      <Col xs={1}></Col>
    </Row>
  );
}

const AnswerButton = styled.div`
  font-size: 2em;
  text-align: center;
  font-weight: 600;
  border: solid;
  margin-top: 12px;
  border-radius: 15px;
  border-width: 1px;
  height: 60px;
  box-shadow: 3px 3px rgba(212, 212, 212, 1);
  cursor: pointer;
`;
