const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { spawn } = require('child_process');

const cameraIP = '192.168.1.100'; // IP address of your IP camera

// Route for serving the web page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Spawn FFmpeg process to capture and stream video from IP camera
  const ffmpeg = spawn('ffmpeg', [
    '-i',
    `rtsp://${cameraIP}/live.sdp`, // RTSP URL of the IP camera
    '-pix_fmt',
    'yuv420p',
    '-f',
    'mpegts',
    'pipe:1',
  ]);

  // Pipe FFmpeg output to Socket.io
  ffmpeg.stdout.pipe(socket.emit('video', { buffer: true }));

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    ffmpeg.kill('SIGINT'); // Terminate FFmpeg process when a user disconnects
  });
});

// Start the server
http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
