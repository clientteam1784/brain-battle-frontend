requireLogin('teacher')

var room = load('room', null)
if (!room) {
  location.href = 'host-create.html'
  room = { id: 0, name: '', max: 24 } // 이동하는 동안 아래 코드가 오류 나지 않게 한다.
}

if (room.started) location.href = 'host-live.html' // 이미 시작한 방은 현황 화면으로 돌아간다.

var teams = []
var pinVisible = false

var chips = document.getElementById('chips')
var errorText = document.getElementById('error')
var togglePin = document.getElementById('togglePin')

document.getElementById('roomName').textContent = room.name

function draw() {
  document.getElementById('count').textContent = '참가자 ' + teams.length + ' / ' + room.max
  
  chips.replaceChildren()
  teams.forEach(function (team) {
    var chip = el('div', 'name', team.name)
    chip.appendChild(el('span', 'x', '✕'))
    chips.appendChild(chip)
  })

  document.getElementById('dots').textContent = pinVisible ? String(room.pin).split('').join(' ') : '● ● ● ● ● ●'
  document.getElementById('start').disabled = teams.length === 0 // 참가자 없이는 시작할 수 없다.
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
  if (teams.length === 0) {
    errorText.textContent = '참가자가 한 명 이상 있어야 시작할 수 있어요.'
    return
  }
  try {
    await api('/rooms/' + room.id + '/start', 'PATCH')
    room.started = true
    save('room', room)
    location.href = 'host-live.html'
  } catch (err) {
    errorText.textContent = err.message
  }
}

loadTeams()
setInterval(loadTeams, 3000)
