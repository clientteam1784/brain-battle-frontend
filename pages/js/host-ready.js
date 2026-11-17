requireLogin('teacher')

var room = load('room', null)
if (!room) {
  location.href = 'host-create.html'
  room = { id: 0, name: '', max: 24 } // 이동하는 동안 아래 코드가 오류 나지 않게 한다.
}

var teams = []
var pinVisible = false

var chips = document.getElementById('chips')
var errorText = document.getElementById('error')
var pinText = document.getElementById('pinText')
var togglePin = document.getElementById('togglePin')

document.getElementById('roomName').textContent = room.name

function draw() {
  // 최대 인원은 백엔드가 모르는 값이라, 이 화면에서 만들 수 있는 모둠 수를 막는 데만 쓴다.
  document.getElementById('count').textContent = '참가자 ' + teams.length + ' / ' + room.max
  
  chips.replaceChildren()
  teams.forEach(function (team) {
    var chip = el('div', 'name', team.name)
    chip.appendChild(el('span', 'x', '✕'))
    chips.appendChild(chip)
  })

  pinText.textContent = pinVisible && room.pin ? room.pin.split('').join(' ') : '● ● ● ● ● ●'
  togglePin.textContent = pinVisible ? 'PIN 숨기기' : 'PIN 보기'
}

async function loadTeams() {
  try {
    teams = await api('/rooms/' + room.id + '/teams')
    draw()
  } catch (err) {
    errorText.textContent = err.message
  }
}

togglePin.onclick = function () {
  pinVisible = !pinVisible
  draw()
}

document.getElementById('start').onclick = async function () {
  errorText.textContent = ''
  try {
    await api('/rooms/' + room.id + '/start', 'PATCH')
    location.href = 'host-live.html'
  } catch (err) {
    errorText.textContent = err.message
  }
}

loadTeams()
setInterval(loadTeams, 3000)
