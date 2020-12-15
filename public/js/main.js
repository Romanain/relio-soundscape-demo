const logForm = document.getElementById('log-form');
const logMessages = document.querySelector('.log-messages');
// const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join office
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputUsers(users);
});

var enter_med_sound = new Howl({
  src: ['sounds/enter_med.mp3']
});

var left_med_sound = new Howl({
  src: ['sounds/left_med.mp3']
})

var ambiance_calm = new Howl({
  src: ['sounds/ambiance_calm.mp3'],
  auoplay: true,
  loop: true
})

ambiance_calm.play()

// Log message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  if (message.type == 'joined') {
    enter_med_sound.play();
  } else if (message.type == 'left') {
    left_med_sound.play();
  }

  // Scroll down
  logMessages.scrollTop = logMessages.scrollHeight;
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.log-messages').appendChild(div);
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
