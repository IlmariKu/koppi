import React from "react";
import { Main } from "./Main.jsx";
import './index.css';
import Amplify from "@aws-amplify/core";

Amplify.configure({
  Auth: {
      region: 'xxxxx,
      userPoolId: 'xxxxx',
      userPoolWebClientId: 'xxxxx'
  }
});

export default () => (
  <>
    <Main />
  </>
);
