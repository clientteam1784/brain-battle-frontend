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
var pins = load('pins', {}) // 모둠 PIN 은 만들 때 한 번만 응답으로 오므로 탭에 저장해 둔다.
var togglePin = document.getElementById('togglePin')

document.getElementById('roomName').textContent = room.name

function draw() {
  // 최대 인원은 백엔드가 모르는 값이라, 이 화면에서 만들 수 있는 모둠 수를 막는 데만 쓴다.
  document.getElementById('count').textContent = '참가자 ' + teams.length + ' / ' + room.max
  
  chips.replaceChildren()
  teams.forEach(function (team) {
    var pin = pins[team.id] ? pins[team.id].split('').join(' ') : '-'
    var chip = el('div', 'name', team.name + '  ' + (pinVisible ? pin : '● ● ● ● ● ●'))
    chip.appendChild(el('span', 'x', '✕'))
    chips.appendChild(chip)
  })

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

document.getElementById('addForm').onsubmit = async function (e) {
  e.preventDefault()
  var input = document.getElementById('teamName')
  var name = input.value.trim()
  errorText.textContent = ''
  if (!name) return
  if (teams.length >= room.max) {
    errorText.textContent = '최대 인원을 넘었어요.'
    return
  }
  try {
    var team = await api('/rooms/' + room.id + '/teams', 'POST', { teamName: name })
    pins[team.id] = team.pin
    save('pins', pins)
    input.value = ''
    loadTeams()
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
