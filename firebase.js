
/* CONFIGURE SEU FIREBASE AQUI */

// exemplo:
// const firebaseConfig = {
// apiKey: "",
// authDomain: "",
// projectId: "",
// storageBucket: "",
// messagingSenderId: "",
// appId: ""
// };

if(typeof firebase !== "undefined"){

firebase.initializeApp(firebaseConfig);
window.firebaseDB = firebase.firestore();

}
