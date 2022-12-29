import { useCallback, useEffect, useState } from "react";
import CredentialForm from "./components/CredentialForm";

function App() {
  const [username, setUsername] = useState(null);

  const attemptIdentifyMe = useCallback(async () => {
    const response = await fetch("/user");
    if (response.ok) {
      const data = await response.json();
      setUsername(data.username);
    } else {
      setUsername(null);
    }
  }, []);
  const attemptRegistration = useCallback(
    async (body) => {
      const response = await fetch("/user/register", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        attemptIdentifyMe();
      } else {
        const data = await response.json();
        console.log(data);
      }
    },
    [attemptIdentifyMe]
  );
  const attemptLogin = useCallback(
    async (body) => {
      const response = await fetch("/user/login", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        attemptIdentifyMe();
      } else {
        const data = await response.json();
        console.log(data);
      }
    },
    [attemptIdentifyMe]
  );
  const logout = useCallback(async () => {
    await fetch("/user", {
      method: "DELETE",
    });
    attemptIdentifyMe();
  }, [attemptIdentifyMe]);

  useEffect(() => {
    attemptIdentifyMe();
  }, [attemptIdentifyMe]);

  return (
    <div>
      {username === null ? (
        <CredentialForm
          onRegister={attemptRegistration}
          onLogin={attemptLogin}
        />
      ) : (
        <div>
          <div>Welcome, {username}!</div>
          <button onClick={logout}>Log out</button>
        </div>
      )}
    </div>
  );
}

export default App;
