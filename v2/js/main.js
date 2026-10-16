(function () {
    var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    // Menu điện thoại
    var menu = $('[data-menu]');
    function setMenu(open) { if (!menu) return; menu.classList.toggle('hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; }
    $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { setMenu(true); }); });
    $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });

    // Ô tìm kiếm trên header
    var sp = $('[data-search-panel]');
    $$('[data-search-toggle]').forEach(function (b) { b.addEventListener('click', function () { sp.classList.toggle('hidden'); if (!sp.classList.contains('hidden')) $('input', sp).focus(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); if (sp) sp.classList.add('hidden'); } });

    // Trượt thông báo ở hero
    $$('[data-slider]').forEach(function (box) {
        var slides = $$('[data-slide]', box), dots = $$('[data-dot]', box), i = 0, t;
        function go(n) { i = (n + slides.length) % slides.length; slides.forEach(function (s, k) { s.classList.toggle('hidden', k !== i); }); dots.forEach(function (d, k) { d.className = 'h-2 rounded-full transition-all ' + (k === i ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300'); }); }
        function start() { stop(); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) t = setInterval(function () { go(i + 1); }, 5000); }
        function stop() { clearInterval(t); }
        dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); start(); }); });
        var pv = $('[data-prev]', box), nx = $('[data-next]', box); if (pv) pv.addEventListener('click', function () { go(i - 1); start(); }); if (nx) nx.addEventListener('click', function () { go(i + 1); start(); });
        box.addEventListener('mouseenter', stop); box.addEventListener('mouseleave', start); start();
    });

    // Hiện dần khi cuộn
    var rv = $$('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) rv.forEach(function (e) { e.classList.add('in'); });
    else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 }); rv.forEach(function (e) { io.observe(e); }); }

    // Lọc bài trong trang chuyên mục
    var f = $('[data-filter]');
    if (f) f.addEventListener('input', function () {
        var q = f.value.trim().toLowerCase(), n = 0;
        $$('[data-grid] > article').forEach(function (a) { var ok = !q || a.getAttribute('data-text').indexOf(q) > -1; a.classList.toggle('hidden', !ok); if (ok) n++; });
        $('[data-empty]').classList.toggle('hidden', n > 0);
    });

    // Trang tìm kiếm (tìm ngay trên trình duyệt, trong cả nội dung bài)
    var si = $('[data-search-input]');
    if (si && window.POSTS) {
        var q = (new URLSearchParams(location.search).get('s') || '').trim(); si.value = q;
        var hits = {}; var ql = q.toLowerCase();
        window.POSTS.forEach(function (p) { if (ql && p.s.indexOf(ql) > -1) hits[p.u] = 1; });
        var n = 0;
        $$('[data-grid] > article').forEach(function (a) { var u = $('a', a).getAttribute('href'); var ok = !!hits[u]; a.classList.toggle('hidden', !ok); if (ok) n++; });
        $('[data-search-info]').textContent = !q ? 'Nhập từ khoá để tìm bài viết.' : (n ? 'Tìm thấy ' + n + ' bài cho “' + q + '”.' : 'Không tìm thấy bài nào cho “' + q + '”. Thử từ khoá ngắn hơn, ví dụ “tuyển sinh”.');
    }

    // Form đăng ký (bản demo: chỉ kiểm tra và báo thành công, không gửi đi đâu)
    function phoneOk(v) { v = v.replace(/[\s.\-()]+/g, '').replace(/^\+?84(\d{9})$/, '0$1'); return /^0[35789]\d{8}$/.test(v); }
    $$('[data-demo-form]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            $$('.js-error', form).forEach(function (x) { x.remove(); });
            var bad = null;
            function err(el, msg) { var p = document.createElement('p'); p.className = 'js-error mt-1 text-sm text-rose-600'; p.textContent = msg; el.insertAdjacentElement('afterend', p); bad = bad || el; }
            var name = form.elements.name, phone = form.elements.phone;
            if (!name.value.trim()) err(name, 'Vui lòng nhập họ và tên.');
            if (!phone.value.trim()) err(phone, 'Vui lòng nhập số điện thoại.');
            else if (!phoneOk(phone.value)) err(phone, 'Số điện thoại chưa đúng. Hãy nhập số di động 10 chữ số (ví dụ: 0912345678).');
            if (bad) { bad.focus(); return; }
            $('[data-form-ok]', form).classList.remove('hidden'); form.reset();
        });
    });

    // Tab lọc nhóm chương trình (+ ?type= trên URL) và nút "Xem thêm" ở trang chủ
    var tabs = $('[data-tabs]'), grid = $('[data-tab-grid]');
    if (tabs && grid) {
        var more = $('[data-more]'), LIMIT = 6, cur = 'all', expanded = false, onHome = !!more;
        var apply = function () {
            var n = 0;
            $$('article', grid).forEach(function (a) {
                var ok = cur === 'all' || a.getAttribute('data-type') === cur, show = ok && (!onHome || expanded || n < LIMIT);
                a.classList.toggle('hidden', !show); if (ok) n++;
            });
            $$('[data-tab]', tabs).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-tab') === cur); });
            if (more) more.parentNode.classList.toggle('hidden', expanded || n <= LIMIT);
        };
        $$('[data-tab]', tabs).forEach(function (b) { b.addEventListener('click', function () { cur = b.getAttribute('data-tab'); apply(); }); });
        if (more) more.addEventListener('click', function () { expanded = true; apply(); });
        var tp = new URLSearchParams(location.search).get('type'); if (tp) cur = tp;
        apply();
    }

    // ===== Trang chủ mẫu 2: slide toàn màn hình, số đếm, parallax, hiện dần =====
    var hero = $('[data-hero]');
    if (hero) {
        var hs = $$('[data-hs]', hero), bars = $$('[data-bar]', hero), cur = $('[data-cur]', hero), idx = 0;
        var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        var show = function (n) {
            idx = (n + hs.length) % hs.length;
            hs.forEach(function (s, k) { s.classList.toggle('on', k === idx); });
            bars.forEach(function (b, k) {
                b.classList.remove('on', 'done');
                if (k < idx) b.classList.add('done');
                if (k === idx) { void b.offsetWidth; b.classList.add(reduce ? 'done' : 'on'); }
            });
            cur.textContent = ('0' + (idx + 1)).slice(-2);
        };
        bars.forEach(function (b, k) {
            b.addEventListener('click', function () { show(k); });
            $('i', b).addEventListener('animationend', function () { if (b.classList.contains('on')) show(idx + 1); });
        });
        var pv = $('[data-prev]', hero), nx = $('[data-next]', hero);
        if (pv) pv.addEventListener('click', function () { show(idx - 1); });
        if (nx) nx.addEventListener('click', function () { show(idx + 1); });
        if (reduce) bars[0].classList.add('done');
    }
    var revealEls = $$('.rv, .mask'); var obsTarget = function (e) { return e.classList.contains('mask') ? e.parentNode : e; };
    if (!('IntersectionObserver' in window)) revealEls.forEach(function (e) { e.classList.add('in'); });
    else { var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { $$('.mask', e.target).concat(e.target.classList.contains('mask') ? [e.target] : []).forEach(function (m) { m.classList.add('in'); }); e.target.classList.add('in'); io2.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' }); var seen = []; revealEls.forEach(function (e) { var t = obsTarget(e); if (seen.indexOf(t) < 0) { seen.push(t); io2.observe(t); } }); }
    var counters = $$('[data-count]');
    if (counters.length && 'IntersectionObserver' in window) {
        var io3 = new IntersectionObserver(function (es) { es.forEach(function (e) {
            if (!e.isIntersecting) return; io3.unobserve(e.target);
            var el = e.target, to = parseInt(el.getAttribute('data-count'), 10), t0 = performance.now();
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return; }
            (function tick(t) { var p = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0);
        }); }, { threshold: .6 });
        counters.forEach(function (c) { c.textContent = '0'; io3.observe(c); });
    }
    var par = $$('[data-parallax]');
    if (par.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var ticking = false;
        var upd = function () { ticking = false; par.forEach(function (el) { var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; el.style.transform = 'translateY(' + ((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1) + 'px)'; }); };
        addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
    }
})();
