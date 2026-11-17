var form = document.getElementById('form')
var codeInput = document.getElementById('code')
var errorText = document.getElementById('error')
var submitButton = document.getElementById('submit')

function showError(message) {
  errorText.textContent = message
  errorText.hidden = !message
  codeInput.classList.toggle('bad', Boolean(message))
}

codeInput.oninput = function () { showError('') }

form.onsubmit = async function (e) {
  e.preventDefault()
  var accessCode = codeInput.value.trim()
  if (!accessCode) {
    showError('인증 코드를 입력해 주세요.')
    return
  }
  submitButton.disabled = true
  showError('')
  try {
    var auth = await api('/auth/teacher', 'POST', { accessCode: accessCode }, true)
    save('token', auth.accessToken)
    save('role', 'teacher')
    location.href = 'host-create.html'
  } catch (err) {
    showError(err.message)
    submitButton.disabled = false
  }
}
