const { WebcastPushConnection } = require('tiktok-live-connector');
const admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');

// Username of someone who is currently live
const tiktokUsername = "user52534867";
var roomID ;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tictok-a07c6-default-rtdb.firebaseio.com/'
});
var database = admin.database();

function create_new_session(data){
    if(roomID != undefined && roomID != ''){
        session_path = 'reader/users/'+tiktokUsername+'/sessions/'+roomID+'/';
        var chatRef = database.ref(session_path);
        chatRef.set({
            'target_user': tiktokUsername,
            // 'room_data': data,
            'created_at': Date.now(),        
            'room_id':data.roomId,
            'unique_id':tiktokUsername
        });
    }
}

function addEventFirebase(eventTitle,data,msg) {    
    if(roomID != undefined && roomID != ''){
        event_path = 'reader/users/'+tiktokUsername+'/sessions/'+roomID+'/events/'+eventTitle+'/'
        var chatRef = database.ref(event_path);
        chatRef.push({
            'target_user': tiktokUsername,        
            'room_id':roomID,
            'created_at': Date.now(),        
            'unique_id':tiktokUsername , 
            'msg' : msg,
            'data' : data
        });
    }
}



// Create a new wrapper object and pass the username
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
    roomID = state.roomId;
    console.log(roomID);
    create_new_session(state);
}).catch(err => {
    console.error('Failed to connect', err);
})

/////////////////////////////////////////////////////////////////////////////////////////////////
tiktokLiveConnection.on('chat', data => {
    msg = `${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`;
    addEventFirebase('chat',data,msg);
    console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})


tiktokLiveConnection.on('like', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) Like`);
    msg  = `${data.uniqueId} (userId:${data.userId}) Like`;
    addEventFirebase('like',data,msg);

})

tiktokLiveConnection.on('gift', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
    msg  =`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`;
    addEventFirebase('gift',data,msg);
})

tiktokLiveConnection.on('subscribe', (data) => {
    console.log(data.uniqueId, "subscribed!");
    msg = data.uniqueId + " subscribed!";
    addEventFirebase('subscribe',data,msg);
})

tiktokLiveConnection.on('follow', (data) => {
    console.log(data.uniqueId, "followed!");
    msg = data.uniqueId+ " followed!";
    addEventFirebase('follow',data,msg);

})

tiktokLiveConnection.on('share', (data) => {
    console.log(data.uniqueId, " shared the stream!");
    msg = data.uniqueId + " shared the stream!";
    addEventFirebase('share',data,msg);

})


tiktokLiveConnection.on('member', data => {
    console.log(`${data.uniqueId} joins the stream!`);
    msg = `${data.uniqueId} joins the stream!`;
    addEventFirebase('member',data,msg);
})

tiktokLiveConnection.on('social', data => {
    console.log('social event data:', data);
    msg = 'social event data: ' + data;
    addEventFirebase('social',data,msg);
})




tiktokLiveConnection.on('envelope', data => {
    console.log('envelope received', data);
    addEventFirebase('subscribe',data,msg);

})

tiktokLiveConnection.on('questionNew', data => {
    console.log(`${data.uniqueId} asks ${data.questionText}`);
    msg= `${data.uniqueId} asks ${data.questionText}`;
    addEventFirebase('questionNew',data,msg);

})

tiktokLiveConnection.on('linkMicBattle', (data) => {
    console.log(`New Battle: ${data.battleUsers[0].uniqueId} VS ${data.battleUsers[1].uniqueId}`);
    msg = `New Battle: ${data.battleUsers[0].uniqueId} VS ${data.battleUsers[1].uniqueId}`;
    addEventFirebase('linkMicBattle',data,msg);

})

tiktokLiveConnection.on('linkMicArmies', (data) => {
    console.log('linkMicArmies', data);
    msg = `linkMicArmies `+data;
    addEventFirebase('linkMicArmies',data,msg);
})

tiktokLiveConnection.on('emote', data => {
    console.log('emote received', data);
    msg = `emote received ` + data;
    addEventFirebase('emote',data,msg);
})

tiktokLiveConnection.on('liveIntro', (msg) => {
    console.log(msg);
    msg = `liveIntro ` + msg;
    addEventFirebase('liveIntro',msg,msg);
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////

tiktokLiveConnection.on('error', err => {
    console.error('Error!', err);
})

tiktokLiveConnection.on('disconnected', () => {
    console.log('Disconnected :(');
    
})

tiktokLiveConnection.on('streamEnd', (actionId) => {
    if (actionId === 3) {
        console.log('Stream ended by user');
    }
    if (actionId === 4) {
        console.log('Stream ended by platform moderator (ban)');
    }
}) 
