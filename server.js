const express = require('express');

const app = express();

const server = require('http').Server(app);
//whats the role of this line above?
const io = require('socket.io')(server);

const {v4: uuidV4} = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));
//why did this?


app.get('/',(req,res)=>{
    res.redirect(`/${uuidV4()}`);
});
app.get('/:room', (req,res)=>{
    res.render('room', {roomId: req.params.room});
})

io.on('connection', socket =>{
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    })
    socket.on('disconnect', ()=>{
        socket.broadcast.emit('user-disconnected');
    })
})

server.listen(3000,()=>{
    console.log('Server is running on port 3000');
});