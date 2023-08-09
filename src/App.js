
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import './styles.css'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState, useRef, useEffect } from 'react';

let udispname, uprofilepic;


firebase.initializeApp({
  apiKey: "AIzaSyCdaTOUNnmPaLKS17dme3x9d1xGj0wo5Lw",
  authDomain: "superchat-apk-7927-9efa6.firebaseapp.com",
  databaseURL: "https://superchat-apk-7927-9efa6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "superchat-apk-7927-9efa6",
  storageBucket: "superchat-apk-7927-9efa6.appspot.com",
  messagingSenderId: "486770614601",
  appId: "1:486770614601:web:61deba6cfbf8d75d677a98"
})

const auth = firebase.auth();
const firestores = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  
  const { currentUser } = auth;
  if (currentUser) {
    udispname = currentUser.displayName;
    uprofilepic = (currentUser.photoURL);

  } else {
    console.log('No user signed in.');
  }
  

  return (
    <div className="">
      {user ? <ChatRoom /> : <SignIn />}
    </div>
  );
}

function SignIn() {
  const signWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(alert);

  }
  const [loginurl, setimageurl] = useState(null);
  const [imgurl, setimgurl] = useState(null);

  useEffect(() => {
    const iref = firebase.storage().refFromURL('gs://superchat-apk-7927-9efa6.appspot.com/perfect.png');
    const irefs = firebase.storage().refFromURL('gs://superchat-apk-7927-9efa6.appspot.com/cat.png');

    iref.getDownloadURL()
      .then(url => {
        setimageurl(url);
      })
      .catch(e => {
        console.error('error downloading, error');
      });

    irefs.getDownloadURL()
      .then(url => {
        setimgurl(url);
      })
      .catch(e => {
        console.error('error downloading, error');
      });
  }, []);

  return (
    <div id="chat-screen">


      <div id='div1'>
        <img src={loginurl} id='div1img' alt='' />
      </div>
      <div id='div2'>
        <h1 id='welc'  >Welcome to the chat room!</h1>
        <div id='inner-image'>
          <img src={imgurl} style={{ maxWidth: '150px', marginRight: '10px', alignContent: 'end' }} alt=''></img>
        </div>

        <button id="sign-in-btn" onClick={signWithGoogle}>Sign in with Google</button>
        <b><p id='sign-inst'>please sign-in continue</p></b>
      </div>

    </div>

  )
}

function Signout() {
  return auth.currentUser && (
    <button id='sign-out-btn' onClick={() => auth.signOut()}>signout</button>
  )
}


function ChatRoom() {
  return (
    <div>
      <div id="sdiv">
        <ChatMessage ></ChatMessage>

      </div>
    </div>
  );

}

function ChatMessage() {



  const messagesRef = firestores.collection("messages");
  const query = messagesRef.orderBy("createdAt");
  const [messages] = useCollection(query, { idField: "id" });
  const div2ChatRef = useRef();

  const msgref = firestores.collection("messages");

  const [isInputProvided, setInputProvided] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [formValue, setFormValue] = useState('');

  async function sendMessage(e) {
    e.preventDefault();
    const { uid } = auth.currentUser;
    await msgref.add({ text: formValue, createdAt: firebase.firestore.FieldValue.serverTimestamp(), uid, udispname, uprofilepic });
    setFormValue('');
    setInputProvided(false);
    setMessageSent(true);
  }
  // to scroll to latest msg
  const scrollToBottom = () => {
    if (div2ChatRef.current) {
      div2ChatRef.current.scrollTop = div2ChatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setFormValue(inputValue);
    setInputProvided(!!inputValue.trim());
    setMessageSent(false);
  };

  if (!messages) {
    return <div>Loading messages...</div>;
  }


  return (


    <div id='chat-container'>
      <div id='div-chat-header'>
        <h2>chat room</h2>
        <Signout></Signout>
      </div>
      <div id='div-chat-body'>
        <div id='div1-chat'>

          <CurrentUserProfile></CurrentUserProfile>

          <form onSubmit={sendMessage}>
            <input id="message-box" value={formValue} autoComplete="off" onChange={handleChange} placeholder="Message"
            ></input>
            <button id="send-btn" type="submit" disabled={!isInputProvided}>
              {isInputProvided ? 'Send' : 'Type message'}
            </button>
          </form>
        </div>
        <div id='div2-chat' ref={div2ChatRef}>
          {messages.docs.map((doc) => {
            const message = doc.data();

            const { text, uid } = message;
            let fmttime = '';
            if (message.createdAt) {
              const crtime = message.createdAt.toDate();
              const day = crtime.getDate();
              const month = crtime.getMonth() + 1;
              const year = crtime.getFullYear();
              const hours = crtime.getHours();
              const minutes = crtime.getMinutes();
              fmttime = `on ${day}/${month}/${year} at ${hours}:${minutes}`
            }
            const messageClass = uid === auth.currentUser.uid ? 'sent' : 'receiver';

            return (

              <div key={doc.id} className={`message ${messageClass}`}>

                <div id='name-prof-disp'>

                  <UserProfile user={message} />

                  <div id='name-disp'>
                    <p id='username'>{message.udispname}</p>
                  </div>
                </div>
                <p>{text}</p>
                <div id='tandd'>
                  <p>{fmttime}</p>
                </div>
              </div>

            );
          })}

        </div>

      </div>
    </div>
  );
}

function UserProfile({ user }) {

  return (

    <>
      {user.uprofilepic && <img id='profile-pic' src={user.uprofilepic} alt="User Profile" />}
    </>

  );
}

function CurrentUserProfile() {
  const currentuser = auth.currentUser;

  if (currentuser) {
    return (
      <div id='cur-user-container'>
        <img id='cur-user-pic' alt='' src={uprofilepic}></img>
        <p id='cur-user-name'>{currentuser.displayName}</p>
        <p id='cur-user-email'>{currentuser.email}</p>
      </div>
    )
  }
}
export default App;
