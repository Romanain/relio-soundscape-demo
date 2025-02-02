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

// Sounds
var enter_sounds = [];
var enter_filenames = ['enter_far', 'enter_med', 'enter_close']
var left_sounds = [];
var left_filenames = ['left_far', 'left_med', 'left_close'];
var ambiance_sounds = [], amb_play = [];
var ambiance_filenames = ['ambiance_very_calm', 'ambiance_calm', 'ambiance_moderate', 'ambiance_busy'];
var talking_sounds = [], tlk_play = [];
var talking_filenames = ['talking_calm', 'talking_moderate', 'talking_busy'];

for (i = 0; i < 3; i++) {
  enter_sounds.push(new Howl({
    src: [`sounds/${enter_filenames[i]}-converted.ogg`]
  }))
}

for (i = 0; i < 3; i++) {
  left_sounds.push(new Howl({
    src: [`sounds/${left_filenames[i]}-converted.ogg`]
  }))
}

for (i = 0; i < 4; i++) {
  ambiance_sounds.push(new Howl({
    src: [`sounds/${ambiance_filenames[i]}-converted.ogg`],
    loop: true,
    volume: 0
  }))
  amb_play.push(ambiance_sounds[i].play());
}

for (i = 0; i < 3; i++) {
  talking_sounds.push(new Howl({
    src: [`sounds/${talking_filenames[i]}-converted.ogg`],
    loop: true,
    volume: 0
  }));
  tlk_play.push(talking_sounds[i].play());
}

var slider = document.getElementById("myRange");

var old_a = 0, old_t = -1, new_a = 0, new_t = -1
var first_round = true;

// Log message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  if (message.type == 'joined') {
    enter_sounds[message.closeness].play();
    console.log('Play enter');
  } else if (message.type == 'left') {
    left_sounds[message.closeness].play();
    console.log('Play leave');
  }

  // Get room and users
  socket.on('roomUsers', ({ room, users }) => {
    filteredUsers = users.filter(function (value, index, arr) {
      return value.username !== username;
    }).sort((a, b) => {
      return b.closeness - a.closeness;
    })
    outputUsers(filteredUsers);
    console.log(filteredUsers);

    old_a = new_a;
    old_t = new_t;

    if (users.length <= 3) {
      new_a = 0;
      new_t = -1;
    } else if (users.length <= 5) {
      new_a = 1;
      new_t = 0;
    } else if (users.length <= 8) {
      new_a = 2;
      new_t = 1;
    } else {
      new_a = 3;
      new_t = 2;
    }


    if (old_a !== new_a) {
      ambiance_sounds[old_a].fade(1, 0, 3000, amb_play[old_a]);
      ambiance_sounds[new_a].fade(0, 1, 3000, amb_play[new_a]);
      console.log(new_a, old_a);
    }

    if (old_t !== new_t) {
      if (old_t >= 0) {
        talking_sounds[old_t].fade(1, 0, 3000);
        console.log(`Old talking ${old_t}`)
      }
      if (new_t >= 0) {
        talking_sounds[new_t].fade(0, 1, 3000);
        console.log(`New talking ${new_t}`)
      }
    }

    //Initialize sounds first round
    if (first_round) {
      ambiance_sounds[new_a].fade(0, 1, 3000, amb_play[new_a]);
      if (new_t >= 0) {
        talking_sounds[new_t].fade(0, 1, 3000, tlk_play[new_t]);
      }
    }

    first_round = false;
  });

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
  users.forEach((user) => {
    const li = document.createElement('li');
    li.classList.add(`closeness-${user.closeness}`)
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

slider.oninput = function () {
  if (this.value <= 100) {
    Howler.volume(this.value / 100);
  }
}
