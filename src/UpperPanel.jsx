import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import styled from "styled-components";
import { MenuIcon } from "../static/svg/MenuIcon.jsx";

export function UpperPanel(props) {
  function openMenu() {
    ga("send", "event", "openMenu", "from_questions");
    props.setMenuOpen(true);
  }

  function openLogin() {
    ga("send", "event", "openLogin", "from_lefthand");
    props.setModal(true);
  }

  return (
    <div>
      <Container>
        <Row style={RowStyle}>
          <Col xs={4}>
            <LoggedOrNot onClick={() => openLogin()}>
              {props.signedIn ? props.currentUser : "ei kirjautunut"}
            </LoggedOrNot>
          </Col>
          <Col xs={3}>
            <ProgressBox>
              {props.signedIn ? (
                <div>
                  <ProgressBar now={props.userSkill} />
              <div>{props.userSkill}%</div>
                </div>
              ) : (
                <div>
                  <ProgressBar animated now={props.userSkill} />
                  <div>{props.userSkill}%</div>
                </div>
              )}
            </ProgressBox>
          </Col>
          <Col xs={3}></Col>
          <Col xs={2}>
            <div style={{ cursor: "pointer" }}>
              <MenuIcon onClick={() => openMenu()} />
            </div>
          </Col>
        </Row>
        <Row>
          <div style={{ height: "10px" }}></div>
        </Row>
      </Container>
    </div>
  );
}

const ProgressBox = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2px;
  text-align: center;
`;

const RowStyle = {
  borderBottom: "solid",
  fontSize: "1.3em",
};

const LoggedOrNot = styled.div`
  cursor: pointer;
`;
