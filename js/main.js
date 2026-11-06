/* Code ML — page behaviors. Each block runs only if its elements exist. */
(function () {
  "use strict";
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------- Main: onboarding stage (auto-advancing slides) ---------- */
  var stage = $("#stage");
  if (stage) {
    var slides = [
      {
        v: "0",
        tag: "STEP 01",
        title: "나에게 맞는<br>커리큘럼 받기",
        desc: "목표와 현재 수준을 고르면, AI 학습 순서를 자동으로 짜 드려요.",
      },
      {
        v: "2",
        tag: "STEP 02",
        title: "짧은 개념으로<br>원리 이해하기",
        desc: "단계마다 꼭 필요한 개념만 골라, 풀기 전에 가볍게 읽어요.",
      },
      {
        v: "1",
        tag: "STEP 03",
        title: "파이썬 코딩테스트로<br>바로 확인하기",
        desc: "배운 개념을 문제로 풀고, 테스트 케이스로 곧바로 채점받아요.",
      },
      {
        v: "0",
        tag: "STEP 04",
        title: "내 기록으로<br>성장 확인하기",
        desc: "푼 문제와 정답률, 학습한 날을 마이페이지에서 한눈에 봐요.",
      },
    ];
    var art = $("#stageArt"),
      text = $("#stageText"),
      bars = $$(".stage-bar", stage),
      count = $("#stageCount");
    var ms = parseInt(stage.getAttribute("data-interval"), 10) || 4000;
    var reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.style.setProperty("--slide-ms", ms + "ms");
    var idx = 0,
      timer = null;
    var pad = function (n) {
      return (n < 10 ? "0" : "") + n;
    };
    function show(i, instant) {
      idx = (i + slides.length) % slides.length;
      var s = slides[idx];
      var apply = function () {
        art.setAttribute("data-v", s.v);
        art.setAttribute("data-slide", String(idx));
        $("#stageTag").textContent = s.tag;
        $("#stageTitle").innerHTML = s.title;
        $("#stageDesc").textContent = s.desc;
        count.innerHTML =
          pad(idx + 1) +
          " / " +
          pad(slides.length) +
          " &nbsp;커리큘럼 → 개념 → 코딩테스트 → 기록";
        text.classList.remove("is-swapping");
      };
      bars.forEach(function (b, k) {
        b.classList.toggle("is-done", k < idx);
        b.classList.remove("is-active");
      });
      void stage.offsetWidth; // restart the fill animation
      bars[idx].classList.add("is-active");
      if (instant || reduced) {
        apply();
      } else {
        text.classList.add("is-swapping");
        setTimeout(apply, 250);
      }
      clearTimeout(timer);
      timer = setTimeout(function () {
        show(idx + 1);
      }, ms);
    }
    bars.forEach(function (b, k) {
      b.addEventListener("click", function () {
        show(k);
      });
    });
    stage.addEventListener("mouseenter", function () {
      clearTimeout(timer);
      var a = bars[idx];
      a.style.animationPlayState = "paused";
    });
    stage.addEventListener("mouseleave", function () {
      bars[idx].style.animationPlayState = "";
      show(idx, true);
    });
    show(0, true);
  }

  /* ---------- Main: bottom carousel with pagination ---------- */
  var track = $("#carTrack");
  if (track) {
    var cards = $$(".card", track),
      pos = 0;
    var prev = $("#carPrev"),
      next = $("#carNext"),
      cc = $("#carCount");
    var perView = function () {
      return window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    };
    function render() {
      var max = Math.max(0, cards.length - perView());
      pos = Math.min(pos, max);
      var step = cards[0].getBoundingClientRect().width + 24;
      track.style.transform = "translateX(" + -pos * step + "px)";
      cc.textContent = pad2(pos + 1) + " / " + pad2(max + 1);
      prev.disabled = pos === 0;
      next.disabled = pos === max;
    }
    function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    }
    prev.addEventListener("click", function () {
      pos = Math.max(0, pos - 1);
      render();
    });
    next.addEventListener("click", function () {
      pos += 1;
      render();
    });
    window.addEventListener("resize", render);
    render();
  }

  /* ---------- Auth: simple client-side validation ---------- */
  var form = $("#authForm");
  if (form) {
    var bad = function (el, msg) {
      el.classList.add("is-error");
      var e = $(".field-error[data-for='" + el.id + "']", form);
      if (e) {
        if (msg) e.textContent = msg;
        e.classList.add("is-visible");
      }
    };
    form.addEventListener("input", function (ev) {
      ev.target.classList.remove("is-error");
      var e = $(".field-error[data-for='" + ev.target.id + "']", form);
      if (e) e.classList.remove("is-visible");
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true,
        f = form.elements;
      if (f.nick && !f.nick.value.trim()) {
        bad(f.nick);
        ok = false;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value)) {
        bad(f.email);
        ok = false;
      }
      if (
        f.password.minLength > 0
          ? f.password.value.length < 8
          : !f.password.value
      ) {
        bad(f.password);
        ok = false;
      }
      if (f.password2 && f.password2.value !== f.password.value) {
        bad(f.password2);
        ok = false;
      }
      if (ok) {
        location.href = f.nick ? "curriculum.html" : "mypage.html";
      }
    });
  }

  /* ---------- Curriculum: goal selection ---------- */
  var goals = $("#goals");
  if (goals) {
    goals.addEventListener("click", function (ev) {
      var b = ev.target.closest(".goal");
      if (!b) return;
      $$(".goal", goals).forEach(function (g) {
        g.classList.toggle("is-selected", g === b);
      });
    });
  }

  /* ---------- My page: heatmap ---------- */
  var heat = $("#heatmap");
  if (heat) {
    var seed = 7,
      rnd = function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    for (var w = 0; w < 14; w++) {
      var col = document.createElement("div");
      col.className = "heat-col";
      for (var d = 0; d < 7; d++) {
        var q = rnd(),
          i = document.createElement("i");
        i.setAttribute(
          "data-l",
          q < 0.4 ? "0" : q < 0.6 ? "1" : q < 0.8 ? "2" : "3",
        );
        col.appendChild(i);
      }
      heat.appendChild(col);
    }
  }

  /* ---------- Learn: tabs, editor, mock grading, result modal ---------- */
  var tabs = $("#tabs");
  if (tabs) {
    tabs.addEventListener("click", function (ev) {
      var t = ev.target.closest(".tab");
      if (!t) return;
      $$(".tab", tabs).forEach(function (x) {
        x.classList.toggle("is-active", x === t);
      });
      $$("[data-pane]").forEach(function (p) {
        p.classList.toggle(
          "is-visible",
          p.getAttribute("data-pane") === t.getAttribute("data-tab"),
        );
      });
    });
  }

  var code = $("#code");
  if (code) {
    var START =
      "def solution(a, b):\n    # 두 수의 합을 반환하세요\n    answer = a + b\n    return answer\n\nprint(solution(3, 5))";
    var hl = $("#codeHl"),
      gutter = $("#gutter"),
      out = $("#out"),
      chips = $("#chips");
    var esc = function (s) {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };
    function paint() {
      var lines = code.value.split("\n");
      hl.innerHTML =
        lines
          .map(function (ln) {
            var c = ln.indexOf("#"),
              head = c >= 0 ? ln.slice(0, c) : ln,
              tail = c >= 0 ? ln.slice(c) : "";
            return (
              esc(head).replace(
                /\b(def|return|print|if|else|elif|for|while|in|import)\b/g,
                '<span class="kw">$1</span>',
              ) + (tail ? '<span class="cm">' + esc(tail) + "</span>" : "")
            );
          })
          .join("\n") + "\n";
      gutter.textContent = lines
        .map(function (_, k) {
          return k + 1;
        })
        .join("\n");
      hl.scrollTop = code.scrollTop;
      hl.scrollLeft = code.scrollLeft;
    }
    code.addEventListener("input", paint);
    code.addEventListener("scroll", function () {
      hl.scrollTop = code.scrollTop;
      hl.scrollLeft = code.scrollLeft;
    });
    code.addEventListener("keydown", function (ev) {
      if (ev.key === "Tab") {
        ev.preventDefault();
        var s = code.selectionStart;
        code.setRangeText("    ", s, code.selectionEnd, "end");
        paint();
      }
    });
    code.value = START;
    paint();

    // Browser-side MOCK grader (not real Python): supports `answer = <expr>` and `return <expr|answer>`
    // where <expr> uses only a, b, digits and + - * / % ( ).
    var CASES = [
      [3, 5, 8],
      [-2, 7, 5],
      [0, 0, 0],
      [1000, -1000, 0],
      [10, 20, 30],
    ];
    var SAFE = /^[ab0-9+\-*\/%() ]+$/;
    function compile(src) {
      var body = src.split("\n").map(function (l) {
        var c = l.indexOf("#");
        return c >= 0 ? l.slice(0, c) : l;
      });
      var def = body.findIndex(function (l) {
        return /^def\s+solution\s*\(\s*a\s*,\s*b\s*\)\s*:/.test(l);
      });
      if (def < 0)
        return { error: "def solution(a, b): 함수를 찾을 수 없어요." };
      var vars = {},
        ret = null;
      for (var i = def + 1; i < body.length; i++) {
        var l = body[i];
        if (/^\S/.test(l)) break;
        var t = l.trim();
        if (!t) continue;
        var as = t.match(/^(\w+)\s*=\s*(.+)$/),
          rt = t.match(/^return\s+(.+)$/);
        if (as) vars[as[1]] = as[2];
        else if (rt) {
          ret = rt[1];
          break;
        }
      }
      if (ret === null) return { error: "return 문이 없어요." };
      var expr = Object.prototype.hasOwnProperty.call(vars, ret.trim())
        ? vars[ret.trim()]
        : ret;
      if (!SAFE.test(expr))
        return {
          error: "모의 채점기는 a, b와 숫자, + - * / % ( ) 만 지원해요.",
        };
      try {
        return { fn: new Function("a", "b", "return (" + expr + ");") };
      } catch (e) {
        return { error: "문법 오류: " + e.message };
      }
    }
    function grade() {
      var c = compile(code.value);
      if (c.error) return { error: c.error };
      var results = CASES.map(function (t) {
        var got;
        try {
          got = c.fn(t[0], t[1]);
        } catch (e) {
          got = "error";
        }
        return { a: t[0], b: t[1], want: t[2], got: got, ok: got === t[2] };
      });
      return { results: results };
    }
    function drawChips(res) {
      chips.innerHTML = res
        .map(function (r, k) {
          return (
            '<span class="chip ' +
            (r.ok ? "ok" : "fail") +
            '">테스트 ' +
            (k + 1) +
            (r.ok ? " ✓" : " ✕") +
            "</span>"
          );
        })
        .join("");
    }
    $("#btnRun").addEventListener("click", function () {
      var g = grade();
      if (g.error) {
        out.textContent = "> " + g.error;
        chips.innerHTML = "";
        return;
      }
      out.textContent =
        "> " + g.results[0].got + "   (예시 a=3, b=5 · 브라우저 모의 실행)";
    });
    $("#btnReset").addEventListener("click", function () {
      code.value = START;
      paint();
      out.textContent = "> 코드를 초기화했어요.";
      chips.innerHTML = "";
    });

    var scrim = $("#scrim"),
      modal = $("#modal"),
      submitCount = 0;
    function openModal(kind, info) {
      var wrong = kind === "wrong";
      modal.className = "modal " + (wrong ? "is-wrong" : "is-correct");
      $("#mIcon").textContent = wrong ? "✕" : "✓";
      $("#mTitle").textContent = wrong ? "오답입니다" : "정답입니다!";
      $("#mDesc").textContent = info.desc;
      $("#mDetail").innerHTML = info.rows
        .map(function (r) {
          return (
            '<div><span class="small muted">' +
            r[0] +
            '</span><span class="mono">' +
            esc(String(r[1])) +
            "</span></div>"
          );
        })
        .join("");
      var b1 = $("#mBtn1"),
        b2 = $("#mBtn2");
      b1.textContent = wrong ? "힌트 보기" : "해설 보기";
      b2.textContent = wrong ? "다시 풀기" : "다음 문제";
      b2.className = "btn " + (wrong ? "btn-primary" : "btn-accent");
      b1.onclick = function () {
        close();
        var t = $('.tab[data-tab="' + (wrong ? "concept" : "solution") + '"]');
        if (t) t.click();
      };
      b2.onclick = function () {
        close();
        if (!wrong) location.href = "curriculum.html";
        else code.focus();
      };
      scrim.classList.add("is-open");
      b2.focus();
    }
    function close() {
      scrim.classList.remove("is-open");
    }
    scrim.addEventListener("click", function (ev) {
      if (ev.target === scrim) close();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") close();
    });

    $("#btnSubmit").addEventListener("click", function () {
      var g = grade();
      submitCount += 1;
      var rows = $("#historyTable"),
        empty = $("#historyEmpty");
      var line = function (ok) {
        if (empty) {
          empty.remove();
          empty = null;
        }
        var d = document.createElement("div");
        d.className = "tr";
        d.innerHTML =
          '<span class="c-title">제출 #' +
          submitCount +
          '</span><span class="c-result"><span class="chip ' +
          (ok ? "ok" : "fail") +
          '">' +
          (ok ? "정답" : "오답") +
          '</span></span><span class="c-time">방금 전</span>';
        rows.insertBefore(d, rows.children[1]);
      };
      if (g.error) {
        line(false);
        openModal("wrong", {
          desc: g.error,
          rows: [["상태", "채점할 수 없음"]],
        });
        return;
      }
      drawChips(g.results);
      var passed = g.results.filter(function (r) {
          return r.ok;
        }).length,
        firstBad = g.results.find(function (r) {
          return !r.ok;
        });
      if (!firstBad) {
        line(true);
        out.textContent = "> 모든 테스트를 통과했어요.";
        openModal("correct", {
          desc: "테스트 " + g.results.length + "개를 모두 통과했어요.",
          rows: [
            ["통과", passed + " / " + g.results.length],
            ["단계 진행", "5 / 12 → 6 / 12"],
          ],
        });
      } else {
        line(false);
        out.textContent =
          "> 테스트 " + (g.results.indexOf(firstBad) + 1) + "에서 실패했어요.";
        openModal("wrong", {
          desc:
            "테스트 " +
            (g.results.indexOf(firstBad) + 1) +
            "번에서 실패했어요. " +
            g.results.length +
            "개 중 " +
            passed +
            "개를 통과했습니다.",
          rows: [
            ["입력", "a = " + firstBad.a + ", b = " + firstBad.b],
            ["기댓값", firstBad.want],
            ["실행 결과", firstBad.got],
          ],
        });
      }
    });
  }
})();
