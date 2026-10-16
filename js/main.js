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
})();
