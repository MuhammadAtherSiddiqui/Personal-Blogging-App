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

import { getFirestore, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

let user = localStorage.getItem("userUid");
user = JSON.parse(user);
const uid = user.uid;
const profileDiv = document.getElementById("profile-div");


const getLoginUserData = async () => {
    const name = document.getElementById("updatedName");
    const email = document.getElementById("updatedEmail");
    const about = document.getElementById("updatedAbout");
    const profileImg = document.getElementById("profile-img");

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        name.value = docSnap.data().name;
        email.value = docSnap.data().email;
        about.value = docSnap.data().about || 'Hello There';
        if (docSnap.data().image) {
            profileImg.innerHTML = `<img src="${docSnap.data().image}" alt="" class="profile-img">`;
        }
    } else {
        console.log("No such document!");
    }
}

const image = document.getElementById("update-image-input");
const profileImg = document.getElementById("profile-img");
let imageFile;
image.addEventListener('change', () => {
    imageFile = image.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
        profileImg.innerHTML = `<img src="${reader.result}" alt="" class="profile-img">`
    }
})

let uploadIamge = (imageFile) => {
    const metadata = {
        contentType: imageFile.type,
    };

    const storageRef = ref(storage, `images/${uid}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile, metadata);
    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        },
        (error) => {
            switch (error.code) {
                case 'storage/unauthorized':
                    break;
                case 'storage/canceled':
                    break;
                case 'storage/unknown':
                    break;
            }
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                profileImg.innerHTML = `<img src="${downloadURL}" alt="" class="profile-img">`

                const userRef = doc(db, "users", uid);
                await updateDoc(userRef, {
                    image: `${downloadURL}`,
                });
            });
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Your profile has been updated',
                showConfirmButton: false,
                timer: 1500
            })

        }
    );
}

const updateInfo = async () => {
    const updatedName = document.getElementById("updatedName");
    const updatedEmail = document.getElementById("updatedEmail");
    const updatedAbout = document.getElementById("updatedAbout");

    const storage = getStorage();

    if (imageFile) {
        uploadIamge(imageFile)
    }


    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        name: updatedName.value,
        email: updatedEmail.value,
        about: updatedAbout.value,
    });
    if (imageFile) {
    } else {

        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Your profile has been updated',
            showConfirmButton: false,
            timer: 1500
        })
    }
}

window.updateInfo = updateInfo;