(function () {
  var root = document.documentElement
  var store = {
    get: function (k) { try { return localStorage.getItem(k) } catch (e) { return null } },
    set: function (k, v) { try { localStorage.setItem(k, v) } catch (e) {} },
  }

  document.getElementById('theme').addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
    root.dataset.theme = dark ? 'light' : 'dark'
    store.set('bt-theme', root.dataset.theme)
  })
  document.querySelectorAll('.view button').forEach(function (b) {
    b.addEventListener('click', function () { root.dataset.view = b.dataset.view; store.set('bt-view', b.dataset.view) })
  })
  var side = document.getElementById('side')
  document.getElementById('menu').addEventListener('click', function () { side.classList.toggle('open') })

  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.closest('figure').querySelector('code').textContent
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy' }, 1400) }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {})
    })
  })

  // chapter progress (kept in this browser only)
  var finished = JSON.parse(store.get('bt-done') || '{}')
  function paint() {
    document.querySelectorAll('.side a[data-slug]').forEach(function (a) { a.classList.toggle('finished', !!finished[a.dataset.slug]) })
  }
  paint()
  var box = document.getElementById('done')
  if (box) {
    var page = document.body.dataset.page
    box.checked = !!finished[page]
    box.addEventListener('change', function () {
      if (box.checked) finished[page] = 1; else delete finished[page]
      store.set('bt-done', JSON.stringify(finished)); paint()
    })
  }

  // highlight current section in "On this page"
  var links = [].slice.call(document.querySelectorAll('.toc a'))
  if (links.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id) })
      })
    }, { rootMargin: '-10% 0px -80% 0px' })
    document.querySelectorAll('.prose h2[id]').forEach(function (h) { io.observe(h) })
  }

  // search
  var q = document.getElementById('q')
  var out = document.getElementById('results')
  q.addEventListener('input', function () {
    var terms = q.value.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length || !window.SEARCH) { out.hidden = true; return }
    var hits = window.SEARCH.map(function (p) {
      var title = p.t.toLowerCase(); var body = p.x.toLowerCase(); var score = 0
      for (var i = 0; i < terms.length; i++) {
        var inT = title.indexOf(terms[i]) >= 0; var inB = body.indexOf(terms[i]) >= 0
        if (!inT && !inB) return null
        score += (inT ? 5 : 0) + (inB ? 1 : 0)
      }
      var at = body.indexOf(terms[0])
      return { p: p, score: score, snip: at >= 0 ? p.x.slice(Math.max(0, at - 40), at + 90) : '' }
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score }).slice(0, 8)
    out.innerHTML = ''
    hits.forEach(function (h) {
      var li = document.createElement('li'); var a = document.createElement('a'); a.href = h.p.u
      a.textContent = h.p.t; var s = document.createElement('small'); s.textContent = h.snip; a.appendChild(s); li.appendChild(a); out.appendChild(li)
    })
    if (!hits.length) { var n = document.createElement('li'); n.style.padding = '.5rem'; n.textContent = 'Nothing found.'; out.appendChild(n) }
    out.hidden = false
  })
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) out.hidden = true })
})()
