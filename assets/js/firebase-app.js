/* ════════════════════════════════════════════════════════════
   FIREBASE-APP.JS — Contact form + News list
   ════════════════════════════════════════════════════════════
   IMPORTANT — about the "apiKey" below:
   This is your Firebase project's PUBLIC web config. Google
   designs this to be visible in every website's source code —
   it just tells the browser WHICH Firebase project to talk to.
   It is NOT a secret and GitHub will not block it.

   Your real protection comes from "Firestore Security Rules"
   (set those up in the Firebase Console — see README.md for the
   exact rules to paste in, so random people on the internet
   can't spam your contact form or news list).
   ════════════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCQ2hFQ8XpvV0A3S8CeNgTq1B9z7lde9k",
  authDomain: "deoria-taekwondo.firebaseapp.com",
  projectId: "deoria-taekwondo",
  storageBucket: "deoria-taekwondo.firebasestorage.app",
  messagingSenderId: "416230792009",
  appId: "1:416230792009:web:4b1cc83181d7d2cdb61898"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ---------- CONTACT FORM: saves a new message into the "contacts" collection ---------- */
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, 'contacts'), {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      message: document.getElementById('message').value,
      createdAt: new Date()
    });
    alert('Message Sent Successfully! We will reach you soon. 🥋');
    e.target.reset();
  } catch (err) {
    alert('Error Sending Message. Please try again.');
  }
});

/* ---------- NEWS SECTION: pulls every document from the "news" collection ----------
   To publish a news item, just add a document to the "news" collection in the
   Firebase Console with these three fields:
     title      -> text shown on the card
     pdf        -> link to the PDF (e.g. uploaded to Firebase Storage or Google Drive)
     createdAt  -> a timestamp/date (so newest shows first)              */
async function loadNews() {
  try {
    const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(newsQuery);
    const grid = document.getElementById('newsGrid');

    if (snapshot.empty) {
      grid.innerHTML = `<div class="news-card"><h3>No news yet — check back soon!</h3><span>Coming Soon →</span></div>`;
      return;
    }

    snapshot.forEach((doc) => {
      const d = doc.data();
      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `<a href="${d.pdf}" target="_blank" rel="noopener"><h3>${d.title}</h3><span><i class="fas fa-file-pdf"></i> View PDF →</span></a>`;
      grid.appendChild(card);
    });
  } catch (err) {
    console.log(err);
  }
}
loadNews();
