import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Container from "react-bootstrap/Container";
import { TaskMain } from "./TaskMain.jsx";
import { SignInModal } from "./SignInModal.jsx";
import { UpperPanel } from "./UpperPanel.jsx";
import { MenuModal } from "./MenuModal.jsx";
import { UpperHome } from "./home/UpperHome.jsx";
import { UserStatus } from "./home/UserStatus.jsx";
import { Courses } from "./home/Courses.jsx";
import Auth from "@aws-amplify/auth";

const analytics_url =
  "https://f51gpjbn08.execute-api.eu-central-1.amazonaws.com/get_analytics";

export function Main(props) {
  const [showModal, setModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [userId, setUserId] = useState("");
  const [course, setCourse] = useState("kemia1");
  const [userSkill, setUserSkill] = useState(0);

  function changeToLoginMenu() {
    setMenuOpen(false);
    setModal(true);
  }

  function createUrl(userId) {
    const newUrl = analytics_url + `?UserId=${userId}&Task=skill`;
    return newUrl;
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
      setUserSkill(content["skill"]);
    })();
  }

  async function isSignedIn() {
    const info = await Auth.currentUserInfo();

    if (info && "attributes" in info) {
      // Info returns relevant info
      setSignIn(true);
      setCurrentUser(info.attributes["custom:first_name"]);
      setUserId(info.attributes["custom:user_id"]);
    } else {
      setSignIn(false);
      setCurrentUser("");
    }
  }

  async function signOut() {
    try {
      await Auth.signOut();
      setSignIn(false);
      setModal(false);
      setCurrentUser("");
      setUserId("");
      ga("send", "event", "signIn", "user_signed_out");
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }

  useEffect(() => {
    isSignedIn();
  }, [""]);

  return (
    <div style={KoppiMain}>
      {course === "" ? (
        <div>
          <UpperHome
            signedIn={signedIn}
            setModal={setModal}
            setMenuOpen={setMenuOpen}
            signOut={signOut}
          />
          <UserStatus
            signedIn={signedIn}
            setModal={setModal}
            setCourse={setCourse}
            userId={userId}
          />
          <Courses setCourse={setCourse} />
        </div>
      ) : (
        <Container fluid>
          <UpperPanel
            setModal={setModal}
            currentUser={currentUser}
            signedIn={signedIn}
            userId={userId}
            userSkill={userSkill}
            setMenuOpen={setMenuOpen}
          />
          <TaskMain
            course={course}
            userId={userId}
            setModal={setModal}
            setUserSkill={setUserSkill}
            getAnalytics={getAnalytics}
          />
        </Container>
      )}
      <div>
        <SignInModal
          setModal={setModal}
          signedIn={signedIn}
          setSignIn={setSignIn}
          signOut={signOut}
          setCurrentUser={setCurrentUser}
          setUserId={setUserId}
          modalOpen={showModal}
        />
        <MenuModal
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          signedIn={signedIn}
          signOut={signOut}
          userId={userId}
          course={course}
          setCourse={setCourse}
          changeToLoginMenu={changeToLoginMenu}
        />
      </div>
    </div>
  );
}

const KoppiMain = {
  maxWidth: "800px",
  maxHeigth: "200px",
  width: "100vh",
  backgroundColor: "red",
  margin: "auto"
};
