import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styled from "styled-components";

const analytics_url =
  "https://f51gpjbn08.execute-api.eu-central-1.amazonaws.com/get_analytics";

export function UserStatus(props) {
  const [tasksDone, setTasksDone] = useState(0);

  function createUrl(userId) {
    const newUrl = analytics_url + `?UserId=${userId}&Task=task_history`;
    return newUrl;
  }

  function getWeekTotal(total) {
    let totalNumber = 0;
    total.forEach(function (day) {
      totalNumber += day[1];
    });
    return totalNumber;
  }

  function getAnalytics(userId) {
    (async () => {
      const url = createUrl(userId);
      const rawResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      setTasksDone(getWeekTotal(content["last_7_days"]));
    })();
  }

  useEffect(() => {
    getAnalytics(props.userId);
  }, [props.userId !== ""]);

  return (
    <Container>
      <Row>
        <Col xs={10}>
          {props.signedIn ? (
            <YouveDone>
              Olet tehnyt viikon aikana {tasksDone} tehtävää!
            </YouveDone>
          ) : (
            <YouveDone>
              Heippa! Näytät olevan uusi täällä. Hyppää suoraan kokeilemaan
              valitsemalla{" "}
              <a onClick={() => console.log("set_course")} style={kemtext}>
                Kemia 1
              </a>{" "}
              tai
              <a onClick={() => console.log("login")} style={kemtext}>
                {" "}
                kirjaudu sisään
              </a>
            </YouveDone>
          )}
        </Col>
      </Row>
    </Container>
  );
}

const kemtext = {
  color: "#6495ed",
  cursor: "pointer",
};

const YouveDone = styled.div`
  height: 110px;
  font-size: 1.3em;
  margin-top: 25px;
  overflow: hidden;
  font-family: HelveticaNeue-Bold;
  text-align: center;
`;
