$(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDIqW4bR9m_GYR06Fd_mdpQ2_CgNdSyIAg",
        authDomain: "tin-fur.firebaseapp.com",
        databaseURL: "https://tin-fur.firebaseio.com",
        projectId: "tin-fur",
        storageBucket: "tin-fur.appspot.com",
        messagingSenderId: "880903844640"
    };
    
    firebase.initializeApp(config);
    
    // get elements
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const btnLogin = document.getElementById('btnLogin');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnLogOut = document.getElementById('btnLogOut');
    
    // Create an event on log in click
    btnLogin.addEventListener('click', e => {
        e.preventDefault();
        // get email and PW
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        // sign in
        const promise = auth.signInWithEmailAndPassword(email, pass);
        // if error
        promise.catch(e => console.log(e.message));
    })
  
    // add signup event
    btnSignUp.addEventListener('click', e => {
        e.preventDefault();
        // create user
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        console.log(email, pass, "SIGN UP");
        // sign in
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        // if error
        promise.catch(e => console.log(e.message));
        
    });
    
    btnLogOut.addEventListener('click', e => {
        e.preventDefault();
        firebase.auth().signOut();
    });
    
    // Add a realtime listener
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser) {
            console.log(firebaseUser);
    } else {
      console.log('not logged in');
      btnLogOut.classList.add('hide');
    }
  
  });
});