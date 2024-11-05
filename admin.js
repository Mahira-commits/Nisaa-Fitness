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

// Now you can use firebase.firestore() and other Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Elements
const welcomeMessage = document.getElementById("welcomeMessage");
const logoutBtn = document.getElementById("logoutBtn");
const sessionList = document.getElementById("adminSessionList");
const createSessionForm = document.getElementById("createSessionForm");

// Display Welcome Message
document.addEventListener("DOMContentLoaded", () => {
    const name = localStorage.getItem("userName");
    welcomeMessage.textContent = `Hi, ${name}!`;
    fetchSessions();
});

// Logout
logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

// Listen for form inputs to update the session list when all fields are filled
createSessionForm.addEventListener("input", () => {
    const location = document.getElementById("sessionLocation").value.trim();
    const sport = document.getElementById("sessionSport").value.trim();
    const dateTime = document.getElementById("sessionDateTime").value.trim();

    // If all fields are filled, update the session list
    if (location && sport && dateTime) {
        fetchSessions();
    }
});

// Handle Create Session Form Submission
createSessionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Submitting create session form");

    const location = document.getElementById("sessionLocation").value;
    const sport = document.getElementById("sessionSport").value;
    const dateTime = document.getElementById("sessionDateTime").value;

    // Add session to Firestore
    db.collection("sessions").add({
        location,
        sport,
        date: new Date(dateTime).toISOString(),
        participants: []
    }).then(() => {
        console.log("Session created successfully");

        // Reset form and update session list
        createSessionForm.reset();
        fetchSessions();
    }).catch(error => {
        console.error("Error creating session:", error);
        alert("Failed to create session. Please try again.");
    });
});

// Fetch and Display Sessions
function fetchSessions() {
    db.collection("sessions").onSnapshot((snapshot) => {
        sessionList.innerHTML = "";
        snapshot.forEach((doc) => {
            const session = doc.data();
            const sessionElement = document.createElement("div");
            sessionElement.classList.add("session");
            sessionElement.innerHTML = `
                <h3>${session.sport} at ${session.location}</h3>
                <p>${new Date(session.date).toLocaleString()}</p>
                <button onclick="deleteSession('${doc.id}')">Delete Session</button>
                <button onclick="joinSession('${doc.id}')">Join</button>
                <button onclick="withdrawFromSession('${doc.id}')">Withdraw</button>
                <h4>Participants:</h4>
                <div>
                    ${session.participants.map(participant => `
                        <div class="participant">
                            ${participant.name} (${participant.phone})
                            <button onclick="togglePaymentStatus('${doc.id}', '${participant.phone}', ${participant.paid})">
                                Mark as ${participant.paid ? 'Unpaid' : 'Paid'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            sessionList.appendChild(sessionElement);
        });
    });
}

// Toggle Payment Status
function togglePaymentStatus(sessionId, phone, currentStatus) {
    db.collection("sessions").doc(sessionId).get().then(doc => {
        const session = doc.data();
        const updatedParticipants = session.participants.map(participant => {
            if (participant.phone === phone) {
                return { ...participant, paid: !currentStatus };
            }
            return participant;
        });

        db.collection("sessions").doc(sessionId).update({
            participants: updatedParticipants
        }).then(fetchSessions);
    });
}

// Delete Session
function deleteSession(sessionId) {
    if (confirm("Are you sure you want to delete this session?")) {
        db.collection("sessions").doc(sessionId).delete().then(fetchSessions);
    }
}

// Join Session
function joinSession(sessionId) {
    const user = { name: localStorage.getItem("userName"), phone: localStorage.getItem("userPhone"), paid: false };
    db.collection("sessions").doc(sessionId).update({
        participants: firebase.firestore.FieldValue.arrayUnion(user)
    }).then(fetchSessions);
}

// Withdraw from Session
function withdrawFromSession(sessionId) {
    const phone = localStorage.getItem("userPhone");
    db.collection("sessions").doc(sessionId).get().then(doc => {
        const updatedParticipants = doc.data().participants.filter(p => p.phone !== phone);
        db.collection("sessions").doc(sessionId).update({ participants: updatedParticipants }).then(fetchSessions);
    });
}