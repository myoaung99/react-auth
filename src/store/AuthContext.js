import React, { useState, createContext, useEffect } from "react";
let loggoutTimer;

// context
const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

// get remaining time in miliseconds
const calculateRemainingTime = (expirationTime) => {
  // function receive string date object

  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remainingTime = adjExpirationTime - currentTime;
  return remainingTime;
};

const retrieveStoredToken = () => {
  const expirationTime = localStorage.getItem("expirationTime");
  const remainingTime = calculateRemainingTime(expirationTime);

  if (remainingTime <= 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return {
    token: localStorage.getItem("token"),
    duration: remainingTime,
  };
};

// provider
export const AuthProvider = (props) => {
  // get token if the remaining time is greater than 1 minute
  const tokenData = retrieveStoredToken();

  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }
  // get from stored token in localStorage

  const [token, setToken] = useState(initialToken);

  // if no token -> false
  const userIsLoggedIn = !!token;

  const logoutHandler = () => {
    setToken(null);
    localStorage.removeItem("token");

    // clear automate loggout if user loggedOut manually
    if (loggoutTimer) {
      clearTimeout(loggoutTimer);
    }
  };

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);

    const remainingTime = calculateRemainingTime(expirationTime);
    // default loggin and loggout timer
    loggoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  // timeout func for auto loggin
  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration);
      // loggout after user opened the browser again
      loggoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData]);

  const contextValue = {
    token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
