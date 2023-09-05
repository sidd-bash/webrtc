const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const peers = {}
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
myVideo.muted = true;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    
    myPeer.on('call', call => {
        console.log('Received a call from user: ' + call.peer);
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            console.log('Received user video stream');
            addVideoStream(video, userVideoStream);
        });
    });
    
    
    socket.on('user-connected', userId =>{
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
});
function addVideoStream(video, stream){
    console.log('Adding video stream');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}



function connectToNewUser(userId, stream){
    console.log('Connecting to new user: ' + userId);
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        console.log('Received user video stream');
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id);
}
);


socket.on('user-connected', userId =>{
    console.log('User connected: '+userId);
});




