let uid = null;

function getPermission() {
    window.FirebasePlugin.hasPermission(function(data){
        if (!data.isEnabled) {
            window.FirebasePlugin.grantPermission();
        }
    });
}

function init() {
    // Initialize Firebase
    var config = {
        apiKey: 'AIzaSyDA5tCzxNzykHgaSv1640GanShQze3UK-M',
        authDomain: 'universalgamemaker.firebaseapp.com',
        databaseURL: 'https://universalgamemaker.firebaseio.com',
        projectId: 'universalgamemaker',
        storageBucket: 'universalgamemaker.appspot.com',
        messagingSenderId: '144595629077'
    };
    firebase.initializeApp(config);
    firebaseLogin();
    getPermission();
    getFCMToken();

    window.FirebasePlugin.onTokenRefresh(function (token) {
        // save this server-side and use it to push notifications to this device
        document.getElementById('myFCMToken').value = token;
        console.log("Got FCM Token:", token);
    }, function (error) {
        console.error(error);
    });

    window.FirebasePlugin.onNotificationOpen(function (notification) {
        document.getElementById('receivedPush').style.display = 'block';
        writeToDebugArea('Recevied push: ' + notification);
        console.log(notification);
    }, function (error) {
        writeToDebugArea('Error: ' + error);
        console.error(error);
    });
}

function writeUser() {
    let myUserPath = `/gamePortal/gamePortalUsers/${uid}`;
    firebase.database().ref(myUserPath).set({
        publicFields: {
            isConnected: true,
            lastSeen: firebase.database.ServerValue.TIMESTAMP,
            supportsWebRTC: true,
        },
        privateFields: {
            createdOn: firebase.database.ServerValue.TIMESTAMP,
            phoneNumber: ``,
            newContacts: ``,
        },
    }).then(() => {
        console.log("Wrote user");
    }).catch(() => {
        console.log("Error writing user");
    });
}

function firebaseLogin() {
    uid = 'uid' + Math.floor(100000 * Math.random());
    console.log("Got uid:", uid);
    document.getElementById('myUserId').value = uid;
    let myUserPath = `/gamePortal/gamePortalUsers/${uid}`;
    firebase.database().ref(myUserPath).once('value').then((snap) => {
        let myUserInfo = snap.val();
        console.log("Got myUserInfo", myUserInfo);
        if (!myUserInfo) {
            writeUser();
            return;
        }
        console.log("User already exists");
    }).catch(() => {
        console.log("Error retrieving user");
    })
}

function getFCMToken() {
    window.FirebasePlugin.getToken(function (token) {
        // save this server-side and use it to push notifications to this device
        document.getElementById('myFCMToken').value = token;
        console.log("Got FCM Token:", token);
    }, function (error) {
        console.error(error);
    });
}

function startPush() {
    setTimeout(sendPush, 2000);
}

function sendPush() {
    writeToDebugArea("Button pressed!");
    var FCMToken = document.getElementById('myFCMToken').value;
    console.log("Writing FCM Token:", FCMToken);
    firebase.database().ref('testPushNotification').set(FCMToken).then(() => {
        console.log("Success!");
        console.log("Finished writing");
    }).catch(() => {
        console.log("Something went wrong");
    });
}

function writeToDebugArea(s) {
    var ele = document.getElementById("debugArea");
    ele.innerHTML += s;
}

document.addEventListener('deviceready', function() {
    init();
    document.getElementById('sendPush').addEventListener('click', startPush);
}, false);
