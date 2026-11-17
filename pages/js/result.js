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

// 학생은 방 번호를 모르므로 방 번호를 1부터 넣어 보며 내 방의 순위표를 찾는다. (다른 방은 403)
// shortcut: 방 번호 1~50 만 찾는다, 방이 그보다 많아지면 로그인 응답에 roomId 를 받도록 바꾼다.
async function showStudent() {
  var total = (await api('/questions')).length
  var ranking = null
  for (var id = 1; id <= 50 && !ranking; id++) {
    try { ranking = await api('/rooms/' + id + '/ranking') } catch (e) { if (e.status !== 403 && e.status !== 404) throw e }
  }
  if (!ranking) throw new Error('결과를 찾을 수 없어요.')
  document.getElementById('sub').textContent = '수고했어요! 최종 순위와 수정 횟수예요'
  addLine(head, '순위', ['이름', '맞힌 개수', '수정 횟수'], '', true)
  var mine = await api('/teams/' + load('teamId', 0) + '/progress')
  var myModify = 0
  mine.questions.forEach(function (q) { if (q.submitCount > 1) myModify += q.submitCount - 1 })
  ranking.forEach(function (team) {
    // 다른 모둠의 수정 횟수는 학생이 볼 수 없어서 '-' 로 둔다. 내 모둠은 점수로 찾는다.
    var isMine = team.currentCount === mine.correctCount
    addLine(body, team.rank, [team.teamName + '팀', team.currentCount + ' / ' + total, isMine && ranking.filter(function (t) { return t.currentCount === mine.correctCount }).length === 1 ? myModify + '회' : '-'], rankClass(team.rank))
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
