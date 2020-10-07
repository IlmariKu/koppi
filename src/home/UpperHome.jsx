import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import styled from "styled-components";
import Hanska from "../../landing_page/images/hanskapallo_light.png";

export function UpperHome(props) {
  return (
    <Container>
      <Row>
        <Col xs={2} />
        <Col xs={7}>
          <LogoArea>
            <LogoText>Koppi</LogoText>
            <img src={Hanska} style={{ height: "60px", margin: "auto" }} />
          </LogoArea>
        </Col>
        <Col xs={3}>
          {props.signedIn ? (
            <LogIn>
              <Button variant="outline-dark" onClick={() => props.setMenuOpen(true)}>
                Profiili
              </Button>
            </LogIn>
          ) : (
            <LogIn>
              <Button variant="dark" onClick={() => props.setModal(true)}>
                Kirjaudu sisään
              </Button>
            </LogIn>
          )}
        </Col>
      </Row>
    </Container>
  );
}

const LogIn = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
`;

const LogoArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  height: 80px;
`;

const LogoText = styled.div`
  font-size: 3.5em;
  font-family: MarkerFelt;
`;
