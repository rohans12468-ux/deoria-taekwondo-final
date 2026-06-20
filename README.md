# Deoria Taekwondo Academy — Website Setup Guide

This guide is written in plain language so you (or anyone helping you later) can
follow it step by step, even without much coding background.

---

## ⚠️ STEP 0 — Do this FIRST, before anything else

Your old code had a real AI key written directly in it (the one starting with
`AQ.Ab8R...`). That key has already been **seen by other people** (it was shared
in chat while debugging), so it must be treated as compromised even though it
never made it to GitHub.

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)** (or Google Cloud Console, wherever you created it).
2. **Delete/revoke that old key.**
3. **Create a brand new key.**
4. Keep the new key somewhere private (a notes app, password manager) — you'll paste it into Netlify in Step 5, never into your code files.

---

## 📁 What changed — file structure

```
deoria-taekwondo/
├── index.html                  ← your webpage (no secrets inside anymore)
├── assets/
│   └── js/
│       ├── ui.js                ← cursor, menu, gallery, animations
│       ├── firebase-app.js      ← contact form + news list
│       └── chatbot.js           ← chat widget (talks to OUR backend, not Google directly)
├── netlify/
│   └── functions/
│       └── chat.js              ← 🔒 the ONLY place your real AI key lives
├── netlify.toml                 ← tells Netlify how to run the site + function
├── firestore.rules              ← copy this into Firebase Console to stop spam
├── .gitignore                   ← stops secret files from ever being committed
└── .env.example                 ← just a reminder of the variable name, not a real secret
```

**Why a "function" instead of calling Google straight from the browser?**
A static website (HTML/CSS/JS) runs entirely on the visitor's computer — anything
written in it, including a key, can be seen by opening DevTools. A "serverless
function" runs on Netlify's servers instead, so the key never leaves there. Your
chat widget now asks *our own function* for an answer, and that function is the
one that asks Google.

---

## 🚀 STEP 1 — Push the code to GitHub

Now that the real key is gone from the code, this part will work fine.

```bash
cd deoria-taekwondo
git init
git add .
git commit -m "Secure rebuild: split JS files, removed exposed API key"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

(If you already have a GitHub repo, just copy these files into it and commit/push as usual.)

---

## 🌐 STEP 2 — Why Netlify (not GitHub Pages) for hosting

GitHub Pages only serves plain files — it **cannot run** the secure backend
function that hides your key. **Netlify's free plan** hosts your website *and*
runs that one small function, so it's the easiest fit here. (Cloudflare Pages is
a similar free alternative if you prefer it later — the same `netlify/functions`
folder logic, just renamed, would need small adjustments.)

---

## 🔧 STEP 3 — Create a Netlify account

1. Go to **[netlify.com](https://www.netlify.com)** and sign up (you can sign in with your GitHub account directly).

---

## 🔗 STEP 4 — Connect your GitHub repo to Netlify

1. In Netlify, click **"Add new site" → "Import an existing project."**
2. Choose **GitHub**, then select your `deoria-taekwondo` repository.
3. Build settings: leave them as detected (this project needs no build step —
   "Publish directory" should be `.` and "Functions directory" `netlify/functions`,
   which `netlify.toml` already sets for you automatically).
4. Click **Deploy**.

---

## 🔑 STEP 5 — Add your secret key to Netlify (never to GitHub)

1. In your Netlify site dashboard, go to **Site configuration → Environment variables.**
2. Click **Add a variable.**
3. Key: `GEMINI_API_KEY`
4. Value: paste the **new** key you created in Step 0.
5. Save, then go to **Deploys → Trigger deploy → Deploy site** so the function picks up the new variable.

That's it — your chatbot will now work, and the key is never visible to anyone
visiting the site or browsing your GitHub repo.

---

## 🔒 STEP 6 — Lock down your database (Firestore)

Right now, without rules, your "contacts" and "news" data could potentially be
read or written by anyone who finds your Firebase project ID — that's a separate
issue from the API key, but worth fixing before going fully public.

1. Go to **[Firebase Console](https://console.firebase.google.com)** → your project → **Firestore Database → Rules**.
2. Replace the rules with the contents of `firestore.rules` from this project.
3. Click **Publish**.

(Note: your Firebase "apiKey" in `firebase-app.js` is fine to be public — that's
how Google designed it. These Firestore Rules are the actual lock on the door.)

---

## 🌍 STEP 7 — Custom domain (optional)

In Netlify: **Domain management → Add a domain**, then point your domain's DNS
to Netlify following their on-screen instructions. Your site will get free
HTTPS automatically.

---

## ✏️ Where to edit things later

| What you want to change | File to open |
|---|---|
| Text, sections, images, layout | `index.html` |
| Photo gallery pictures | `assets/js/ui.js` → the `GALLERY_IMGS` list near the top |
| Contact form behaviour | `assets/js/firebase-app.js` |
| Chatbot personality / rules | `netlify/functions/chat.js` → the `buildSystemPrompt` function |
| Chatbot suggested question chips | `assets/js/chatbot.js` → the `CHIPS` list |
| Colors / fonts | `index.html` → inside `<style>`, the `:root { --red: ...; --gold: ...; }` section at the top |

Every file has comments in plain language above the tricky parts, so you can
search for what you want to change and read the note right above it.

---

## ✅ Quick checklist before you call it "live"

- [ ] Old Gemini key revoked, new one created
- [ ] New key added to Netlify environment variables (not in any file)
- [ ] Site pushed to GitHub successfully (no more push-protection error)
- [ ] Site deployed on Netlify and loads correctly
- [ ] Chatbot replies when you test it on the live site
- [ ] Contact form submits and shows up in Firebase Console
- [ ] Firestore Security Rules published
- [ ] (Optional) Custom domain connected
