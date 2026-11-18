var role = load('role', null)
if (!load('token', null)) location.href = 'role.html'

var head = document.getElementById('head')
var body = document.getElementById('body')
var errorText = document.getElementById('error')

// 첫 칸은 순위 배지, 나머지는 글자. strongIndex 번째 칸은 굵게 쓴다.
function addLine(parent, first, rest, firstClass, isHead) {
  var line = isHead ? parent : el('div', 'line')
  line.appendChild(isHead ? el('p', '', first) : el('div', 'badge ' + (firstClass || ''), first))
  rest.forEach(function (text, i) {
    line.appendChild(el('p', !isHead && i === 0 ? 'strong' : '', text))
  })
  if (!isHead) parent.appendChild(line)
}

async function showTeacher() {
  var room = load('room', null)
  var total = (await api('/questions')).length
  var ranking = await api('/rooms/' + room.id + '/ranking')
  var modifies = await loadModifyCounts(room.id)
  document.getElementById('sub').textContent = '수고했어요! 최종 순위와 수정 횟수예요'
  addLine(head, '순위', ['이름', '맞힌 개수', '수정 횟수'], '', true)
  ranking.forEach(function (team) {
    addLine(body, team.rank, [team.teamName + '팀', team.currentCount + ' / ' + total, (modifies[team.teamName] || 0) + '회'], rankClass(team.rank))
  })
}

async function showStudent() {
  var total = (await api('/questions')).length
  var ranking = await api('/rooms/' + load('roomId', 0) + '/ranking')
  document.getElementById('sub').textContent = '수고했어요! 최종 순위와 수정 횟수예요'
  addLine(head, '순위', ['이름', '맞힌 개수', '수정 횟수'], '', true)
  var mine = await api('/teams/' + load('teamId', 0) + '/progress')
  var myModify = 0
  mine.questions.forEach(function (q) { if (q.submitCount > 1) myModify += q.submitCount - 1 })
  ranking.forEach(function (team) {
    // 다른 모둠의 수정 횟수는 학생이 볼 수 없어서 '-' 로 둔다.
    var isMine = team.teamId === load('teamId', 0)
    addLine(body, team.rank, [team.teamName + '팀', team.currentCount + ' / ' + total, isMine ? myModify + '회' : '-'], rankClass(team.rank))
  })
}

async function start() {
  try {
    if (role === 'teacher') await showTeacher()
    else await showStudent()
  } catch (err) {
    errorText.textContent = err.message
  }
}
start()
