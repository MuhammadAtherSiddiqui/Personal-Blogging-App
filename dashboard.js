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

import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'it';
let user = localStorage.getItem("userUid");
user = JSON.parse(user);
const userUid = user.uid;
console.log(userUid);

const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        localStorage.clear()
        window.location.replace("index.html")

    }).catch((error) => {
        // An error happened.
        console.log("error", error)
    });
})

const publishBlog = async () => {
    let blogTitle = document.getElementById('blog-title');
    let blogBody = document.getElementById('blog-body');
    if (blogTitle.value.length >= '5') {
        if (blogBody.value.length >= '100') {
            try {

                const docRef = await addDoc(collection(db, "blogs"), {
                    blogTitle: blogTitle.value,
                    blogBody: blogBody.value,
                    userUid: userUid,
                    time: serverTimestamp(),
                });
                blogTitle.value = "";
                blogBody.value = "";
                console.log("Document written with ID: ", docRef.id);
                getblogs(docRef.id)
            } catch (e) {
                console.log('error', e)
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Body should be at least hundread charectors long',
            })
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Title should be at least five charectors long',
        })
    }
}

const getblogs = (docID) => {
    const myBlogsDiv = document.getElementById('my-blogs-div')
    const q = query(collection(db, "blogs"), where("userUid", "==", userUid), orderBy('time', "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        myBlogsDiv.innerHTML = "";
        const blogs = [];
        querySnapshot.forEach((doc) => {
            blogs.push(doc.data());
        });
        console.log("Blogs =>", blogs);
        blogs.forEach((v, i) => {
            myBlogsDiv.innerHTML += `
                    <div class="blog-div mt-3">
                        <div class="blog-account-details">
                            <div class="blog-account-pic">
                            ${v.image ? `<img src="${v.image}" class="user-profile-image">` : `<i class="fa-solid fa-user profile-icon" style="color: #949494;"></i>`}
                            </div>
                            <div class="blog-account-name">
                                <div class="blog-title">${v.blogTitle}</div>
                                <div> <span class="name">M.Ather</span> - <span class="name">19 August 2023</span>
                                </div>
                            </div>
                        </div>
                        <div class="blog-body">${v.blogBody}</div>
                        <div class="blog-footer">
                            <button type="button" class="button" onclick='editPost(this, "${docID}")'>
                                Edit
                            </button>
                            <button class="button delete" onclick='deletePost("${docID}")'>
                                Delete
                            </button>
                        </div>
                    </div>
            `;
        })
    });
    let edit = true;
    const editPost = async (e, docId) => {
        if (edit) {
            e.parentNode.parentNode.childNodes[3].setAttribute("contenteditable", true);
            e.parentNode.parentNode.childNodes[3].focus()
            e.innerHTML = 'Update';
            edit = false;
        } else {
            e.parentNode.parentNode.childNodes[3].setAttribute("contenteditable", false);
            e.innerHTML = 'Edit';
            edit = true;
            console.log(e.parentNode.parentNode.childNodes[3].innerText)
            await setDoc(doc(db, "blogs", docId), {
                blogBody: e.parentNode.parentNode.childNodes[3].innerText,
                time: serverTimestamp(),
                blogTitle: e.parentNode.parentNode.childNodes[1].innerText,
                userUid: userUid,
            });
        }


    }

    const deletePost = (docId) => {
        console.log(docId)
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                console.log(docId)
                await deleteDoc(doc(db, "blogs", `${docId}`));
                Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                )
            }
        })
    }
}


getblogs();

// window.editPost = editPost;
// window.deletePost = deletePost;
window.publishBlog = publishBlog;
