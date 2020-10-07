import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Auth from "@aws-amplify/auth";
import crypto from "crypto";

export function Register(props) {
  const [registerStatus, changeRegisterStatus] = useState("");

  function generateRandomId(){
    // Copied https://stackoverflow.com/a/9408217
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    const randomId = crypto.createHash('sha1').update(current_date + random).digest('hex');
    return randomId
  }

  async function signUp() {
    try {
      event.preventDefault();
      const newUser = {}
      newUser.attributes = {}
      newUser.username = document.getElementById("email").value;
      newUser.password = document.getElementById("password").value;
      newUser.attributes["custom:first_name"] = document.getElementById("firstName").value;
      newUser.attributes["custom:last_name"] = document.getElementById("lastName").value;
      newUser.attributes["custom:user_id"] = generateRandomId()
      ga("send", "event", "signIn", "user_registered");
      const user = await Auth.signUp(newUser);
      if ("user" in user){
        // Register was success
        props.changeSignInStatus("registered")
        props.changeRegisteringStatus(false)
      }
    } catch (error) {
      console.error("error signing up", error);
      const errorCode = error?.code;
      if (errorCode == "UserNameExistsException"){
        changeRegisterStatus("Käyttäjä tällä sähköpostilla on jo olemassa.")
      } else (
        changeRegisterStatus(`Virhe luodessa käyttäjää: ${errorCode}`)
      )
    }
  }

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Uusi käyttäjä</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
        <Form.Group controlId="firstName">
            <Form.Label>Etunimi</Form.Label>
            <Form.Control type="name" placeholder="Etunimi" />
          </Form.Group>
          <Form.Group controlId="lastName">
            <Form.Label>Sukunimi</Form.Label>
            <Form.Control type="name" placeholder="Sukunimi" />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Sähköposti</Form.Label>
            <Form.Control type="email" placeholder="Sähköposti" />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Salasana</Form.Label>
            <Form.Control type="password" placeholder="Salasana" />
          </Form.Group>
          <div style={{"color": "red"}}>{registerStatus}</div>
          <Button onClick={() => signUp()} variant="primary" type="submit">
            Rekisteröidy
          </Button>
        </Form>
      </Modal.Body>
    </div>
  );
}
