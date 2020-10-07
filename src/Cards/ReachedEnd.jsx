import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import styled from "styled-components";

export function ReachedEnd(props) {
  return (
    <Container>
      <div style={{ height: "150px" }}></div>
      <TextArea>
        <div>
          <ClickLink onClick={() => props.setModal(true)}>
            Kirjaudu sisään
          </ClickLink>
          jotta voit jatkaa ja tallentaa tilanteesi.
        </div>
      </TextArea>
    </Container>
  );
}

const TextArea = styled.div`
  font-size: 1.5em;
  text-align: center;
`;

const ClickLink = styled.div`
  cursor: pointer;
  color: blue;
`;
