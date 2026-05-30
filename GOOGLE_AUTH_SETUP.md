# Google Authentication Setup Guide (Production Integration)

In our DeskFlow AI MVP, the **"Continue with Google"** button simulates logging in. To make this **100% real and secure** in your production app, you need to connect to Google's official OAuth servers. 

Here are the step-by-step instructions on how to implement real Google Authentication.

---

## Method 1: Using Supabase or Firebase Auth (Recommended & Easiest)
Using a backend-as-a-service like Firebase or Supabase is the fastest way to implement Google Sign-In securely, as they handle token verification and user databases automatically.

### Step 1: Create a Google Cloud Project & OAuth Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **DeskFlow AI**.
3. Go to **APIs & Services > OAuth consent screen**. 
   - Choose **External** user type.
   - Input your App Name, support email, and developer contact info.
4. Go to **APIs & Services > Credentials**. Click **Create Credentials > OAuth client ID**.
   - Select **Web Application** as application type.
   - **Authorized JavaScript origins**: Add your frontend URL (e.g. `http://localhost:5173` and your domain).
   - **Authorized redirect URIs**: Add the callback redirect URL provided by Firebase/Supabase (e.g. `https://your-project.firebaseapp.com/__/auth/handler`).
5. Copy your **Client ID** and **Client Secret**.

### Step 2: Implement in React (Firebase Example)
Install the Firebase SDK:
```bash
npm install firebase
```

Create a file `src/firebase.js` to initialize Firebase:
```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

Now, replace the Google Login click handler in `src/App.jsx` with the following:
```javascript
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

const handleGoogleAuth = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Google returns the verified user profile details
    const googleUser = {
      name: result.user.displayName,
      email: result.user.email,
      avatar: result.user.photoURL || result.user.displayName.substring(0, 1),
      role: 'owner',
      niche: 'dental' // Default or let them select upon first login
    };
    
    setUser(googleUser);
    triggerToast(`Logged in as ${googleUser.name}`, 'green');
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    triggerToast("Google sign-in failed.");
  }
};
```

---

## Method 2: Native Google Identity Services SDK (Direct Setup)
If you want to write your own backend API and avoid Firebase/Supabase, you can load Google's native JavaScript library directly.

### Step 1: Load Google Client Script
Add this to your `index.html` inside the `<head>` section:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 2: Initialize in React
Inside your Login component, render and hook the Google Sign-In button:
```javascript
/* global google */ // Tells ESLint that 'google' is a global window variable

useEffect(() => {
  // Initialize Google SDK
  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  // Render the official Google Sign-In Button on your login page
  google.accounts.id.renderButton(
    document.getElementById("googleBtnDiv"),
    { theme: "outline", size: "large", width: "100%" }
  );
}, []);

// Callback triggered after customer selects their Google account
const handleCredentialResponse = async (response) => {
  const idToken = response.credential; // Secure encrypted JWT token from Google

  // Send the token to your Node.js/Python backend for verification
  const res = await fetch("https://api.deskflow.com/v1/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken })
  });

  const sessionUser = await res.json();
  setUser(sessionUser);
};
```

### Step 3: Verify the Token on Your Backend (Node.js/Express)
On your backend server, install Google's official library:
```bash
npm install google-auth-library
```

Verify the token in your backend authentication router:
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com");

app.post('/v1/auth/google', async (req, res) => {
  const { token } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
    });
    const payload = ticket.getPayload();
    const userId = payload['sub']; // Google user unique ID
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];

    // 1. Check if user exists in database, if not create them.
    // 2. Generate a custom login JWT for your session.
    
    res.json({
      name,
      email,
      avatar: picture || name[0],
      role: 'owner',
      niche: 'dental'
    });
  } catch (err) {
    res.status(401).send("Invalid Google Token");
  }
});
```
