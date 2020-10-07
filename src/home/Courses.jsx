import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styled from "styled-components";
import { LockIcon } from "../../static/svg/LockIcon.jsx";

export function Courses(props) {
  const courses = ["Kemia 2", "Kemia 3", "Kemia 4", "Kemia 5"].map(function (
    courseName
  ) {
    return (
      <Row key={courseName}>
        <Col xs={12}>
          <CourseArea course={courseName}>
            <Course>
              <CourseText>{courseName}</CourseText>
              <LockIcon style={{"margin": "auto 0", "marginTop": "5px"}} />
            </Course>
          </CourseArea>
        </Col>
      </Row>
    );
  });

  function selectCourse() {
    props.setCourse("Kemia1");
    ga('send', 'event', 'courseSelected', "kemia1")
  }

  return (
    <Container>
      <Row>
        <Col xs={12}>
          <CourseArea onClick={() => selectCourse()} course={"Kemia 1"}>
            <Course>
              <CourseText>{"Kemia 1"}</CourseText>
            </Course>
          </CourseArea>
        </Col>
      </Row>
      {courses}
    </Container>
  );
}

const Course = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 35px;
  width: 90%;
  margin-left: 5%;
  margin: auto;
`;

const CourseArea = styled.div`
  height: 65px;
  margin-top: 10px;
  border: solid;
  border-width: 1px;
  border-radius: 25px;
  cursor: pointer;
  background-color: ${(props) =>
    props.course === "Kemia 1" ? "white" : "#F7F7F7"};
`;

const CourseText = styled.div`
  margin-top: 13px;
  margin-left: 10px;
  font-size: 1.6em;
  font-family: HelveticaNeue-Bold;
`;
