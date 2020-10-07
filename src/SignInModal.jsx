import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Auth from "@aws-amplify/auth";
import { Register } from "./Register.jsx";

export function SignInModal(props) {
  const [registering, changeRegisteringStatus] = useState(false);
  const [signInStatus, changeSignInStatus] = useState("");

  async function signIn() {
    try {
      event.preventDefault();
      const username = document.getElementById("formBasicEmail").value;
      const password = document.getElementById("formBasicPassword").value;
      const user = await Auth.signIn(username, password);
      props.setModal(false);
      props.setSignIn(true);
      props.setCurrentUser(user.attributes["custom:first_name"]);
      props.setUserId(user.attributes["custom:user_id"]);
      ga("send", "event", "signIn", "user_signed_in");
    } catch (error) {
      console.error("error signing in", error);
      if (
        error?.code == "UserNotFoundException" ||
        error?.code == "NotAuthorizedException"
      ) {
        changeSignInStatus("no_user");
      }
    }
  }

  function closeModal() {
    props.setModal(false);
    if (registering) {
      ga("send", "event", "signIn", "closed_sign_in", `in_register_window`);
    } else {
      ga("send", "event", "signIn", "closed_sign_in", `in_signin_window`);
    }
    changeRegisteringStatus(false);
    changeSignInStatus("");
  }

  return (
    <Modal show={props.modalOpen} onHide={() => closeModal()}>
      {props.signedIn ? (
        <div>
          <Modal.Header closeButton>
            <Modal.Title>Kirjaudu ulos</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button onClick={() => props.signOut()} variant="warning" type="submit">
              Kirjaudu ulos
            </Button>
          </Modal.Body>
        </div>
      ) : registering ? (
        <Register
          changeSignInStatus={changeSignInStatus}
          changeRegisteringStatus={changeRegisteringStatus}
        />
      ) : (
        <div>
          <Modal.Header closeButton>
            <Modal.Title>Kirjaudu sisään</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Sähköposti</Form.Label>
                <Form.Control type="email" placeholder="Sähköposti" />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Salasana</Form.Label>
                <Form.Control type="password" placeholder="Salasana" />
              </Form.Group>
              <Button onClick={() => signIn()} variant="primary" type="submit">
                Kirjaudu sisään
              </Button>
            </Form>
            {signInStatus === "no_user" ? (
              <div style={{ color: "red" }}>
                Sähköposti tai salasana oli väärin.
              </div>
            ) : signInStatus === "registered" ? (
              <div style={{ color: "green" }}>
                Rekisteröinti onnistui! Voit nyt kirjautua sisään
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            Sinulla ei ole tunnusta?
            <Button
              onClick={() => changeRegisteringStatus(true)}
              variant="warning"
            >
              Rekisteröidy
            </Button>
          </Modal.Footer>
        </div>
      )}
    </Modal>
  );
}
