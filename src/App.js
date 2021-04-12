import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBL-7a50DkjpV2R1h3YpxHuJZIkrFUYLqE",
  authDomain: "sofkachat-team.firebaseapp.com",
  projectId: "sofkachat-team",
  storageBucket: "sofkachat-team.appspot.com",
  messagingSenderId: "716971991738",
  appId: "1:716971991738:web:85e3a4d57d79eda0a11883",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>Sofka Chat</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function ChatRoom() {
  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limitToLast(30);
  const [messages] = useCollectionData(query, { idField: "id" });
  const dummy = useRef();

  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    dummy.current.scrollIntoView({behavior: 'smooth'})
  })
  
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
      photoURL,
    });

    setFormValue("");
  };



  return (
    <main>
      <div>
        {messages &&
          messages.map((msn) => <ChatMessage key={msn.id} message={msn} />)}

         
      </div>
      <div>
        <form onSubmit={sendMessage}>
          <input
            value={formValue}
            onChange={(e) => {
              setFormValue(e.target.value);
            }}
            placeholder="Escribe aquí"
          />
          <button type="submit" disabled={!formValue} >Send</button>
        </form>
      </div>
      <span ref={dummy}></span>
    </main>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, displayName } = message;

  const messageOrderClass = uid === auth.currentUser.uid ? "send" : "received";

  return (
    <div children={"message " + messageOrderClass}>
      <img src={photoURL} alt={"avatar"} />
      <small>{displayName}</small>
      <p>{text}</p>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with google</button>;
}

function SignOut() {
  return (
    auth.currentUser && (
      <button
        onClick={() => {
          auth.signOut();
        }}
      >
        Sign out
      </button>
    )
  );
}

export default App;
