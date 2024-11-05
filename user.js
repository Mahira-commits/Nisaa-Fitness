// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase (add this before accessing any Firebase services)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // If already initialized, use that one
}

// Firebase configuration (should already be initialized if included previously)
const db = firebase.firestore();
const auth = firebase.auth();

// Elements
const welcomeMessage = document.getElementById("welcomeMessage");
const logoutBtn = document.getElementById("logoutBtn");
const sessionList = document.getElementById("sessionList");

// Display Welcome Message
document.addEventListener("DOMContentLoaded", () => {
    const userName = localStorage.getItem("userName");
    if (userName) {
        welcomeMessage.textContent = `Hi, ${userName}!`;
    }
    fetchSessions();
});

// Logout
logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

// Fetch and Display Sessions with Join/Withdraw options
function fetchSessions() {
    db.collection("sessions").onSnapshot((snapshot) => {
        sessionList.innerHTML = ""; // Clear current sessions list

        const userName = localStorage.getItem("userName");
        const userPhone = localStorage.getItem("userPhone");

        snapshot.forEach((doc) => {
            const session = doc.data();
            const sessionId = doc.id;

            // Check if the user is already a participant
            const userJoined = session.participants.some(
                participant => participant.name === userName && participant.phone === userPhone
            );

            // Create session element with Join/Withdraw button
            const sessionElement = document.createElement("div");
            sessionElement.classList.add("session");
            sessionElement.innerHTML = `
                <h3>${session.sport} at ${session.location}</h3>
                <p>${new Date(session.date).toLocaleString()}</p>
                <div>
                    <button onclick="${userJoined ? `withdrawFromSession('${sessionId}')` : `joinSession('${sessionId}')`}">
                        ${userJoined ? "Withdraw" : "Join"}
                    </button>
                </div>
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

// Join Session
function joinSession(sessionId) {
    const userName = localStorage.getItem("userName");
    const userPhone = localStorage.getItem("userPhone");

    const user = { name: userName, phone: userPhone, paid: false }; // Assuming paid status is false by default
    db.collection("sessions").doc(sessionId).update({
        participants: firebase.firestore.FieldValue.arrayUnion(user)
    }).then(() => {
        console.log("Joined session successfully.");
        fetchSessions(); // Refresh sessions list to update join/withdraw button
    }).catch(error => {
        console.error("Error joining session:", error);
    });
}

// Withdraw from Session
function withdrawFromSession(sessionId) {
    const userPhone = localStorage.getItem("userPhone");

    db.collection("sessions").doc(sessionId).get().then(doc => {
        const session = doc.data();
        
        // Filter out the user from participants
        const updatedParticipants = session.participants.filter(
            participant => participant.phone !== userPhone
        );

        // Update Firestore with the new participants list
        return db.collection("sessions").doc(sessionId).update({
            participants: updatedParticipants
        });
    }).then(() => {
        console.log("Withdrawn from session successfully.");
        fetchSessions(); // Refresh sessions list to update join/withdraw button
    }).catch(error => {
        console.error("Error withdrawing from session:", error);
    });
}