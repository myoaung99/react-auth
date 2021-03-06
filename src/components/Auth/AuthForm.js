import { useState, useRef, useContext } from "react";
import AuthContext from "../../store/AuthContext";
import { useHistory } from "react-router-dom";

import classes from "./AuthForm.module.css";

const AuthForm = () => {
  // local states
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // refs
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  // global auth token context
  const authCtx = useContext(AuthContext);

  // router v5 navigate method
  const history = useHistory();

  // switch between login & sign up
  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  // form submit handler
  const submitHandler = (event) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    // optional: Add validation
    let url;
    if (isLogin) {
      // login mode
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDrWmjAnH2SbhX09iBg8JL0GWdb6NtY9LU";
    } else {
      // sign up mode
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDrWmjAnH2SbhX09iBg8JL0GWdb6NtY9LU";
    }
    // loading state -> true
    setIsLoading(true);

    // send http request
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }) // handle response
      .then((res) => {
        // done loading -> false
        setIsLoading(false);

        if (res.ok) {
          return res.json();
        } else {
          // ... error handler
          return res.json().then(() => {
            // show error modal
            let message = "Authentication failed.";

            // if (data && data.error && data.error.message) {
            //   message = data.error.message;
            // }
            throw new Error(message);
          });
        }
      })
      .then((data) => {
        const expireTime = new Date(
          new Date().getTime() + +data.expiresIn * 1000
        );

        // login -> set token to global state
        authCtx.login(data.idToken, expireTime.toISOString());
        // redirect to /
        history.replace("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" ref={emailInputRef} required />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            ref={passwordInputRef}
            required
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button onClick={submitHandler}>
              {isLogin ? "Login" : "Create Account"}
            </button>
          )}

          {isLoading && <p>Sending request...</p>}

          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
