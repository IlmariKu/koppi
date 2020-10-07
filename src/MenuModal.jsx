import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import styled from "styled-components";
import { Bar } from "react-chartjs-2";

const analytics_url =
  "https://f51gpjbn08.execute-api.eu-central-1.amazonaws.com/get_analytics";

var graphData;

export function MenuModal(props) {
  const [graphLoading, setGraphLoading] = useState(true);
  function backToHome() {
    props.setCourse("");
    props.setMenuOpen(false);
  }

  function createUrl(userId) {
    const newUrl = analytics_url + `?UserId=${userId}&Task=task_history`;
    return newUrl;
  }

  function iterateData(total) {
    const graphData = {
      labels: [],
      datasets: [{ data: [] } ]
    }
    total.forEach(function (day) {
      graphData.labels.push(day[0]);
      graphData.datasets[0].data.push(day[1]);
    });
    setGraphLoading(false);
    return graphData;
  }

  function createGraph(userId) {
    const graafi = getAnalytics(userId, iterateData);
    return graafi
  }

  function getAnalytics(userId, iterateData) {
    (async () => {
      const url = createUrl(userId);
      const rawResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await rawResponse.json();
      const iterated = iterateData(response["last_7_days"]);
      graphData = iterated
      return iterated;
    })();
  }

  function logOutAndCloseMenu() {
    props.signOut();
    props.setMenuOpen(false);
  }

  useEffect(() => {
    createGraph(props.userId);
  }, [props.userId]);

  return (
    <Modal
      show={props.menuOpen}
      onHide={() => props.setMenuOpen(false)}
      centered
    >
      <div style={{ fontSize: "2vh", textAlign: "center" }}>Edistymisesi</div>
      <div style={{ height: "300px", marginTop: "20px" }}>
        {graphLoading ? (
          <div>Latautuu</div>
        ) : (
          <Bar
            data={graphData}
            options={{
              maintainAspectRatio: false,
              legend: { display: false },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                    },
                  },
                ],
              },
            }}
          />
        )}
      </div>
      <div
        style={{ height: "30px", borderBottom: "solid", borderWidth: "1px" }}
      ></div>
      <div style={{ height: "20px" }}></div>
      <ListGroup>
        {!props.signedIn ? (
          <ListGroup.Item onClick={() => props.changeToLoginMenu()}>
            <Pointer>Kirjaudu sisään</Pointer>
          </ListGroup.Item>
        ) : null}
        {props.course !== "" ? (
          <ListGroup.Item onClick={() => backToHome()}>
            <Pointer>Palaa kotiruutuun</Pointer>
          </ListGroup.Item>
        ) : null}
        {props.signedIn ? (
          <ListGroup.Item onClick={() => logOutAndCloseMenu()}>
            <Pointer>Kirjaudu ulos</Pointer>
          </ListGroup.Item>
        ) : null}
      </ListGroup>
    </Modal>
  );
}

const Pointer = styled.div`
  cursor: pointer;
`;
