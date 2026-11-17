requireLogin('student')

document.getElementById('me').textContent = load('studentNumber', '') + ' (나)'
var roomName = load('roomName', '')
if (roomName) document.getElementById('roomName').textContent = roomName

// 선생님이 게임을 시작하면(진행 조회의 roomStarted) 2초 안에 문제 화면으로 간다.
async function checkStart() {
  try {
    var progress = await api('/teams/' + load('teamId', 0) + '/progress')
    if (progress.roomStarted) location.href = 'player-quiz.html'
  } catch (err) {}
}
checkStart()
setInterval(checkStart, 2000)
