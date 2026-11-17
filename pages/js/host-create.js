requireLogin('teacher')

var list = document.getElementById('list')
var countText = document.getElementById('count')
var errorText = document.getElementById('error')
var dialog = document.getElementById('dialog')
var numberInput = document.getElementById('number')
var answerInput = document.getElementById('answer')
var dialogError = document.getElementById('dialogError')
var maxText = document.getElementById('max')
var editing = null // null 이면 새 문제, 문제 객체면 그 문제를 수정 중
var maxPeople = 24
var nextNumber = 1
var answers = load('answers', {}) // 서버는 정답을 돌려주지 않으므로, 이 탭에서 입력한 정답만 기억해 보여 준다.
var DEFAULT_MAX_SUBMIT = 3 // 디자인에는 없지만 백엔드가 요구하는 값

document.getElementById('padSlot').appendChild(makeSymbolPad(answerInput, true))

// 최대 인원 스테퍼 (백엔드에는 저장되지 않고, 선생님 화면의 모둠 수 제한에만 쓴다)
function drawMax() {
  maxText.textContent = maxPeople
  document.getElementById('maxNote').textContent = '최대 ' + maxPeople + '명까지 입장할 수 있어요'
}
document.getElementById('minus').onclick = function () {
  if (maxPeople > 1) maxPeople -= 1
  drawMax()
}
document.getElementById('plus').onclick = function () {
  if (maxPeople < 99) maxPeople += 1
  drawMax()
}

// 문제 목록을 서버에서 다시 읽어 그린다.
async function loadQuestions() {
  try {
    var questions = await api('/questions')
    countText.textContent = '문제 (' + questions.length + '개 등록됨)'
    list.replaceChildren()
    questions.forEach(function (q) {
      var row = el('div', 'row')
      var left = el('div', 'left')
      left.append(el('span', 'no', q.questionNumber + '번'), el('span', 'ans', '정답  ' + (answers[q.id] === undefined ? '등록됨' : answers[q.id])))
      var tools = el('div', 'tools')
      var edit = el('button', '', '수정')
      edit.onclick = function () { openDialog(q) }
      var del = el('button', '', '삭제')
      del.onclick = function () { removeQuestion(q) }
      tools.append(edit, el('span', '', '·'), del)
      row.append(left, tools)
      list.appendChild(row)
    })
    nextNumber = questions.length ? questions[questions.length - 1].questionNumber + 1 : 1
  } catch (err) {
    errorText.textContent = err.message
  }
}

async function removeQuestion(q) {
  if (!confirm(q.questionNumber + '번 문제를 삭제할까요?')) return
  try {
    await api('/questions/' + q.id, 'DELETE')
    delete answers[q.id]
    save('answers', answers)
    loadQuestions()
  } catch (err) {
    errorText.textContent = err.message
  }
}

function openDialog(q) {
  editing = q
  document.getElementById('dialogTitle').textContent = q ? '문제 수정' : '문제 추가'
  document.getElementById('more').hidden = Boolean(q)
  numberInput.value = q ? q.questionNumber : nextNumber
  answerInput.value = q ? answers[q.id] || '' : ''
  dialogError.textContent = ''
  dialog.showModal()
}

// 문제 하나를 저장한다. keepOpen 이 true 면 창을 닫지 않고 다음 번호로 바꾼다. (+ 하나 더)
async function saveQuestion(keepOpen) {
  var body = {
    questionNumber: Number(numberInput.value),
    answer: answerInput.value.trim(),
    maxSubmitCount: editing ? editing.maxSubmitCount : DEFAULT_MAX_SUBMIT,
  }
  if (!body.answer) {
    dialogError.textContent = '정답을 입력해 주세요.'
    return
  }
  try {
    var saved = editing ? await api('/questions/' + editing.id, 'PATCH', body) : await api('/questions', 'POST', body)
    answers[saved.id] = body.answer
    save('answers', answers)
  } catch (err) {
    dialogError.textContent = err.message
    return
  }
  await loadQuestions()
  if (keepOpen) {
    numberInput.value = body.questionNumber + 1
    answerInput.value = ''
    answerInput.focus()
  } else {
    dialog.close()
  }
}

document.getElementById('add').onclick = function () { openDialog(null) }
document.getElementById('close').onclick = function () { dialog.close() }
document.getElementById('cancel').onclick = function () { dialog.close() }
document.getElementById('saveBtn').onclick = function () { saveQuestion(false) }
document.getElementById('more').onclick = function () { saveQuestion(true) }

// 방을 만들고 방 번호와 방 이름, 최대 인원을 저장한 뒤 준비 화면으로 간다.
document.getElementById('make').onclick = async function () {
  var button = this
  button.disabled = true // 빠르게 두 번 눌러도 방이 하나만 만들어지게 한다.
  errorText.textContent = ''
  try {
    var room = await api('/rooms', 'POST')
    save('room', {
      id: room.id,
      pin: room.pin,
      name: document.getElementById('roomName').value.trim() || '수학 퀴즈 배틀',
      max: maxPeople,
    })
    save('pins', {})
    location.href = 'host-ready.html'
  } catch (err) {
    errorText.textContent = err.message
    button.disabled = false
  }
}

loadQuestions()
