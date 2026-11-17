var pin = load('pin', null)
if (!pin) location.href = 'player-pin.html'

var nameInput = document.getElementById('student')
var errorText = document.getElementById('error')
var submitButton = document.getElementById('submit')

function showError(message) {
  errorText.textContent = message
  errorText.hidden = !message
  nameInput.classList.toggle('bad', Boolean(message))
}

nameInput.oninput = function () {
  document.getElementById('counter').textContent = nameInput.value.length + ' / 8'
  showError('')
}

// 백엔드의 studentNumber(문자열) 칸에 이름을 넣어 로그인한다. 같은 모둠 안에서 이름이 같으면 같은 학생으로 본다.
document.getElementById('form').onsubmit = async function (e) {
  e.preventDefault()
  var name = nameInput.value.trim()
  if (!name) {
    showError('이름을 입력해 주세요.')
    return
  }
  if (!/^[가-힣0-9]+$/.test(name)) {
    showError('이름은 한글과 숫자만 쓸 수 있어요.')
    return
  }
  submitButton.disabled = true
  try {
    var auth = await api('/auth/student', 'POST', { teamPin: pin, studentNumber: name }, true)
    save('token', auth.accessToken)
    save('role', 'student')
    save('teamId', auth.teamId)
    save('studentNumber', name)
    location.href = 'player-ready.html'
  } catch (err) {
    if (err.status === 401) {
      location.href = 'player-pin.html?error=1' // 없는 모둠 PIN
      return
    }
    showError(err.message)
    submitButton.disabled = false
  }
}
