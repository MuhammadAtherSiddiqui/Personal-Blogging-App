import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";
const firebaseConfig = {
    apiKey: "AIzaSyBSWdt_o-J1y44lTef5FJKbFVLxhylDE-U",
    authDomain: "blogapp-7c2fd.firebaseapp.com",
    projectId: "blogapp-7c2fd",
    storageBucket: "blogapp-7c2fd.appspot.com",
    messagingSenderId: "698364285070",
    appId: "1:698364285070:web:63a4628a0d9c001e1b79df",
    measurementId: "G-FZNX5GE91D"
};

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
auth.languageCode = 'it';



const addUserData = () => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let repeatPassword = document.getElementById("repeat-password");
    let firstName = document.getElementById("first-name");
    let lastName = document.getElementById("last-name");
    let name = firstName.value + " " + lastName.value;
    console.log(firstName.value.trim().length)
    if (firstName.value.trim().length > "3") {
        if (lastName.value.trim().length > "1") {
            if (lastName.value.trim().length <= "20") {
                if (email.value.trim().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
                    console.log(password.value.trim())
                    if (password.value.trim().match(/^(?=.*[a-z])(?=.*[A-Z]).{8,15}$/)) {
                        if (password.value.trim() == repeatPassword.value.trim()) {
                            createUserWithEmailAndPassword(auth, email.value, password.value)
                                .then(async (userCredential) => {
                                    const user = userCredential.user;
                                    try {
                                        console.log(user.uid)
                                        await setDoc(doc(db, "users", user.uid), {
                                            firstName: firstName.value,
                                            lastName: lastName.value,
                                            name: name,
                                            email: email.value,
                                            password: password.value,
                                            uid: user.uid,
                                            image: false,
                                        });
                                        // localStorage.setItem("userUid", `${user.uid}`)
                                        localStorage.setItem("userUid", JSON.stringify(user));
                                        window.location.replace("dashboard.html")
                                    }
                                    catch (e) {
                                        console.log("Error", e)
                                    }
                                })
                                .catch((error) => {
                                    const errorCode = error.code;
                                    const errorMessage = error.message;
                                    console.log("errorMessage", errorMessage);
                                    for (var i = 0; i < errorMessage.length; i++) {
                                        if (errorMessage.slice(i, i + 1) == "/") {
                                            // console.log(errorMessage.slice(i+1))

                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Oops...',
                                                text: `${errorMessage.slice(i + 1, errorMessage.length - 2)}`,
                                            })
                                            break

                                        }
                                    }
                                    email.value = "";
                                    password.value = "";
                                    repeatPassword.value = "";
                                    firstName.value = "";
                                    lastName.value = "";
                                });

                        } else {
                            password.style.borderColor = 'red';
                            repeatPassword.style.borderColor = 'red';
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Password is not equal to confirm password',
                            })
                        }
                    } else {
                        password.style.borderColor = 'red';
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Password should be atleast 8 charectors long or must contain one capital and one lower case letter',
                        })
                    }
                } else {
                    email.style.borderColor = 'red';
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Email should be like abc@gmail.com',
                    })
                }
            } else {
                lastName.style.borderColor = 'red';
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Last name can only contain 20 charectors',
                })
            }
        } else {
            lastName.style.borderColor = 'red';
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Last name should be atleast 1 charectors',
            })
        }

    } else {
        firstName.style.borderColor = 'red';
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'First name should be atleast 5 charectors',
        })
    }
}

const login = () => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");

    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem("userUid", JSON.stringify(user));
            window.location.replace("dashboard.html");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('errorMessage', errorMessage);
            for (var i = 0; i < errorMessage.length; i++) {
                if (errorMessage.slice(i, i + 1) == "/") {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: `${errorMessage.slice(i + 1, errorMessage.length - 2)}`,
                    })
                    break

                }
            }

            email.value = "";
            password.value = "";
        });
}

const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            try {
                await setDoc(doc(db, "users", user.uid), {
                    name: user.displayName,
                    email: user.email,
                    uid: user.uid,
                    about: 'Hello, there',
                    image: user.photoURL,
                });
                localStorage.setItem("userUid", `${user.uid}`)
                window.location.replace("dashboard.html")
            }
            catch (e) {
                console.log("Error", e)
            }
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('errorCode', errorCode)
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
            for (var i = 0; i < errorMessage.length; i++) {
                if (errorMessage.slice(i, i + 1) == "/") {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: `${errorMessage.slice(i + 1, errorMessage.length - 2)}`,
                    })
                    break
                }
            }
        });
}


if( localStorage.getItem("userUid")){

    let user = localStorage.getItem("userUid");
    user = JSON.parse(user);
    const userUid = user.uid;
    console.log(userUid)
    
    if (userUid && window.location.pathname != "/chat.html") {
        window.location.replace("profile.html")
    } else {
        console.log("User is signed out")
    }
    
}

window.signInWithGoogle = signInWithGoogle;
window.addUserData = addUserData;
window.login = login;