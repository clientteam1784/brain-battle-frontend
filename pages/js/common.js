// 모든 페이지가 같이 쓰는 도우미. 백엔드 주소가 다르면 아래 한 줄만 바꾼다.
var API_BASE_URL = 'http://localhost:8000'

// 로그인 정보는 탭마다 따로 저장한다. (선생님/학생을 창을 나눠서 테스트할 수 있다)
function save(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

function load(key, fallback) {
  try {
    var value = sessionStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch (e) {
    return fallback
  }
}

// 사용자가 입력한 글자는 항상 textContent 로만 넣는다. (innerHTML 금지)
function el(tag, className, text) {
  var node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

// 백엔드 호출. 실패하면 화면에 보여 줄 한국어 메시지를 담은 Error 를 던진다.
async function api(path, method, body, isPublic) {
  var headers = {}
  var token = load('token', null)
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token && !isPublic) headers.Authorization = 'Bearer ' + token

  var res
  try {
    res = await fetch(API_BASE_URL + path, {
      method: method || 'GET',
      headers: headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new Error('서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.')
  }

  var data = null
  try {
    data = await res.json()
  } catch (e) {
    data = null
  }

  if (!res.ok) {
    // 로그인이 필요한 요청이 401 이면 토큰이 만료된 것이다.
    if (res.status === 401 && !isPublic) location.href = 'role.html'
    var error = new Error((data && data.message) || '요청에 실패했어요. (' + res.status + ')')
    error.status = res.status
    throw error
  }
  return data
}

// 잘못된 역할로 들어오면 첫 화면으로 보낸다.
function requireLogin(role) {
  if (!load('token', null) || load('role', null) !== role) location.href = 'role.html'
}

// 모둠별 수정 횟수 { 모둠이름: 횟수 }. 문제마다 첫 제출 이후 다시 채점된 횟수를 모두 더한다. (선생님 화면용)
async function loadModifyCounts(roomId) {
  var teams = await api('/rooms/' + roomId + '/teams')
  var counts = {}
  await Promise.all(teams.map(async function (team) {
    var progress = await api('/teams/' + team.id + '/progress')
    counts[team.name] = 0
    progress.questions.forEach(function (q) {
      if (q.submitCount > 1) counts[team.name] += q.submitCount - 1
    })
  }))
  return counts
}

// 1~3위는 금·은·동, 나머지는 기본색 배지
function rankClass(rank) {
  return rank <= 3 ? 'r' + rank : ''
}

// 수식 버튼: 입력칸의 커서 위치에 기호를 넣는다. withCompare 가 false 면 < > 는 뺀다. (Figma 11번 화면)
function makeSymbolPad(input, withCompare) {
  var symbols = [
    ['π', 'π'], ['x²', '²'], ['√', '√'], ['÷', '÷'], ['×', '×'], ['≤', '≤'],
    ['<', '<'], ['>', '>'], ['≥', '≥'], ['( )', '()'], ['a/b', '/'],
  ]
  var pad = el('div', 'symbols')
  symbols.forEach(function (pair) {
    if (!withCompare && (pair[0] === '<' || pair[0] === '>')) return
    var button = el('button', 'chip', pair[0])
    button.type = 'button'
    button.onclick = function () {
      var start = input.selectionStart
      input.value = input.value.slice(0, start) + pair[1] + input.value.slice(input.selectionEnd)
      input.focus()
      input.setSelectionRange(start + pair[1].length, start + pair[1].length)
    }
    pad.appendChild(button)
  })
  return pad
}

// 모든 화면 공통: 배경 장식, 뒤로가기 버튼, 로고. <body data-back="이동할 주소"> 로 뒤로가기 목적지를 정한다.
function decorate() {
  var deco = el('div', 'deco')
  ;['c1', 'c2', 'c3', 'c4', 'p1', 'p2', 'p3', 'p4'].forEach(function (name) {
    deco.appendChild(el('div', 'd ' + name))
  })
  var brand = el('div', 'brand')
  brand.append(el('div', 'logo', 'π'), el('span', '', '수학퀴즈배틀'))
  document.body.prepend(deco, brand)
  // 첫 화면(data-back="none")은 Figma 에 뒤로가기 버튼이 없다.
  var target = document.body.getAttribute('data-back')
  if (target !== 'none') {
    var back = el('a', 'back', '← 뒤로가기')
    back.href = target || 'javascript:history.back()'
    document.body.prepend(back)
  }
}
decorate()
