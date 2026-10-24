<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDq3pQu5xt01XQfeuApEoSRI5OS3NkMFeM",
    authDomain: "smart-hydroponic-pakcoy.firebaseapp.com",
    databaseURL: "https://smart-hydroponic-pakcoy-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-hydroponic-pakcoy",
    storageBucket: "smart-hydroponic-pakcoy.firebasestorage.app",
    messagingSenderId: "668887083920",
    appId: "1:668887083920:web:b2cc569f23c72bd2892115",
    measurementId: "G-G6R183K5N3"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>