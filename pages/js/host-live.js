requireLogin('teacher')

var room = load('room', null)
if (!room) {
  location.href = 'host-create.html'
  room = { id: 0, name: '', max: 24 } // 이동하는 동안 아래 코드가 오류 나지 않게 한다.
}

var teamsBox = document.getElementById('teams')
var errorText = document.getElementById('error')
var total = null // 전체 문제 수

async function refresh() {
  try {
    if (total === null) total = (await api('/questions')).length
    var ranking = await api('/rooms/' + room.id + '/ranking')
    var modifies = await loadModifyCounts(room.id)
    teamsBox.replaceChildren()
    ranking.forEach(function (team) {
      var card = el('div', 'team' + (team.rank === 1 ? ' first' : ''))
      card.appendChild(el('div', 'rank ' + rankClass(team.rank), team.rank))
      var info = el('div', 'info')
      info.append(el('p', 'name', team.teamName + '팀'), el('p', 'state', '수정 ' + (modifies[team.teamName] || 0) + '회'))
      var score = el('div', 'score')
      var digits = el('div', 'digits')
      digits.append(el('span', 'big', team.currentCount), el('span', 'of', '/ ' + total))
      score.append(el('p', 'cap', '맞힌 개수'), digits)
      card.append(info, score)
      teamsBox.appendChild(card)
    })
    errorText.textContent = ''
  } catch (err) {
    errorText.textContent = err.message
  }
}

// 백엔드에 게임 종료 API 가 아직 없어서, 선생님 화면만 결과 화면으로 이동한다.
document.getElementById('end').onclick = function () {
  if (!confirm('게임을 마감하고 결과를 볼까요?')) return
  room.ended = true
  save('room', room) // 결과 화면이 이 방 정보를 읽는다. 방 만들기 화면이 끝난 방은 버린다.
  location.href = 'result.html'
}

refresh()
setInterval(refresh, 3000)
