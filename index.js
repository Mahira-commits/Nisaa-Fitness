// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEO8rg38I6wFinA0nmdlWOeDYRGJPf_LU",
    authDomain: "nisaafitness-791a4.firebaseapp.com",
    databaseURL: "https://nisaafitness-791a4-default-rtdb.firebaseio.com",
    projectId: "nisaafitness-791a4",
    storageBucket: "nisaafitness-791a4.firebasestorage.app",
    messagingSenderId: "1035201602320",
    appId: "1:1035201602320:web:7c80408df9d3c51a40bb95",
    measurementId: "G-C2NMC6CV06"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// Elements
const loginForm = document.getElementById("loginForm");
const sessionList = document.getElementById("sessionList");

// Handle Login
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const phone = e.target.phone.value;

    if (name && phone) {
        checkAdminStatus(name, phone).then(isAdmin => {
            // Store the user's name and phone in localStorage after successful login
            localStorage.setItem("userName", name);
            localStorage.setItem("userPhone", phone);

            // Redirect based on admin status
            if (isAdmin) {
                window.location.href = "admin.html";
            } else {
                window.location.href = "user.html";
            }
        }).catch(error => {
            console.error("Error checking admin status:", error);
            alert("An error occurred. Please try again.");
        });
    }
});

// Check if the user exists in the admins collection
function checkAdminStatus(name, phone) {
    return db.collection("admins")
        .where("name", "==", name)
        .where("phone", "==", phone)
        .get()
        .then(querySnapshot => {
            return !querySnapshot.empty;
        });
}

// Fetch and Display Sessions
function fetchSessions() {
    db.collection("sessions").onSnapshot((snapshot) => {
        sessionList.innerHTML = ""; // Clear current sessions list
        snapshot.forEach((doc) => {
            const session = doc.data();
            const sessionElement = document.createElement("div");
            sessionElement.classList.add("session");
            sessionElement.innerHTML = `
                <h3>${session.sport} at ${session.location}</h3>
                <p>${new Date(session.date).toLocaleString()}</p>
                <h4>Participants:</h4>
                <div>
                    ${session.participants.length > 0 
                        ? session.participants.map(participant => `
                            <div class="participant">
                                ${participant.name} (${participant.phone})
                            </div>
                          `).join('')
                        : "<p>No participants yet.</p>"
                    }
                </div>
            `;
            sessionList.appendChild(sessionElement);
        });
    });
}

// Call fetchSessions to load sessions when the page loads
document.addEventListener("DOMContentLoaded", fetchSessions);