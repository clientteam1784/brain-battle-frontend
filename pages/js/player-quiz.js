requireLogin('student')

var teamId = load('teamId', 0)
var questions = [] // [{ id, questionNumber, ... }]
var progress = null // 서버가 알려 주는 모둠 진행 상황
var typed = {} // 문제 id -> 입력창에 쓴 글자 (제출 전까지 이 탭에만 있다)
var index = 0

var tabs = document.getElementById('tabs')
var answerInput = document.getElementById('answer')
var errorText = document.getElementById('error')
var infoText = document.getElementById('info')

document.getElementById('padSlot').appendChild(makeSymbolPad(answerInput, false))

function stateOf(question) {
  return progress.questions.find(function (q) { return q.questionId === question.id })
}

function draw() {
  var question = questions[index]
  var state = stateOf(question)
  document.getElementById('title').textContent = question.questionNumber + '번'

  tabs.replaceChildren()
  questions.forEach(function (q, i) {
    var s = stateOf(q)
    var answered = s.status !== 'UNSUBMITTED'
    var tab = el('button', 'tab ' + s.status + (answered ? ' done' : '') + (i === index ? ' current' : ''), q.questionNumber)
    tab.type = 'button'
    tab.onclick = function () { go(i) }
    tabs.appendChild(tab)
  })

  answerInput.value = typed[question.id] !== undefined ? typed[question.id] : state.submittedAnswer || ''
  answerInput.disabled = state.locked
  if (state.status === 'CORRECT') infoText.textContent = '정답이에요! 이 문제는 잠겼어요'
  else if (state.status === 'EXHAUSTED') infoText.textContent = '제출 기회를 모두 썼어요'
  else if (state.status === 'WRONG') infoText.textContent = '오답이에요. 다시 풀어 보세요 (남은 기회 ' + state.remainingAttempts + '번)'
  else infoText.textContent = '정답을 입력하고 다음 문제로 넘어가 보세요'
  document.getElementById('prev').disabled = index === 0
  document.getElementById('next').disabled = index === questions.length - 1
}

// 다른 문제로 가기 전에 지금 입력한 글자를 기억해 둔다.
function go(i) {
  typed[questions[index].id] = answerInput.value
  index = i
  errorText.textContent = ''
  draw()
}

// Enter 를 치면 다음 문제로 넘어간다. (마지막 문제에서는 가만히 둔다)
answerInput.onkeydown = function (e) {
  if (e.key === 'Enter' && index < questions.length - 1) go(index + 1)
}
document.getElementById('prev').onclick = function () { go(index - 1) }
document.getElementById('next').onclick = function () { go(index + 1) }

// 새로 쓰거나 고친 답만 보낸다. 같은 답을 다시 보내면 제출 횟수가 줄어든다.
document.getElementById('submit').onclick = async function () {
  typed[questions[index].id] = answerInput.value
  var answers = []
  questions.forEach(function (q) {
    var state = stateOf(q)
    var text = (typed[q.id] || '').trim()
    if (!state.locked && text && text !== (state.submittedAnswer || '')) {
      answers.push({ questionId: q.id, submittedAnswer: text })
    }
  })
  if (answers.length === 0) {
    errorText.textContent = '새로 제출할 답이 없어요.'
    return
  }
  errorText.textContent = ''
  var button = this
  button.disabled = true // 같은 답이 두 번 채점되지 않도록 응답이 올 때까지 막는다.
  try {
    progress = await api('/teams/' + teamId + '/answers/batch', 'POST', { answers: answers })
    typed = {}
    if (progress.finished) {
      location.href = 'result.html'
      return
    }
    var next = questions.findIndex(function (q) { return q.id === progress.nextQuestionId })
    index = next === -1 ? index : next
    draw()
    errorText.textContent = progress.correctCount + ' / ' + progress.totalQuestions + '개 맞혔어요. 틀린 문제는 다시 풀어 보세요.'
  } catch (err) {
    errorText.textContent = err.message
  } finally {
    button.disabled = false
  }
}

async function start() {
  try {
    questions = await api('/questions')
    progress = await api('/teams/' + teamId + '/progress')
    if (questions.length === 0) {
      errorText.textContent = '아직 등록된 문제가 없어요.'
      return
    }
    draw()
  } catch (err) {
    errorText.textContent = err.message
  }
}
start()
