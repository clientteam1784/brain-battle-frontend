var pinInput = document.getElementById('pin')
var errorText = document.getElementById('error')

function showError(message) {
  errorText.textContent = message
  errorText.hidden = !message
  pinInput.classList.toggle('bad', Boolean(message))
}

// 틀린 PIN 으로 로그인에 실패하면 ?error=1 로 돌아와 오류를 보여 준다. (Figma 08)
if (location.search.indexOf('error=1') !== -1) showError('방이 없어요. PIN 번호를 다시 확인해 주세요.')

pinInput.oninput = function () {
  pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 6)
  showError('')
}

// 백엔드는 PIN 과 이름(학번)을 한 번에 받아 로그인하므로, 여기서는 형식만 확인하고 PIN 을 저장해 둔다.
document.getElementById('form').onsubmit = function (e) {
  e.preventDefault()
  if (pinInput.value.length !== 6) {
    showError('PIN 번호 6자리를 입력해 주세요.')
    return
  }
  save('pin', pinInput.value)
  location.href = 'player-student.html'
}
