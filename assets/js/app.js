/* =========================================================================
   Mr. BARBER — UI + логіка запису.
   Дані (ціни, майстри, квіз) беруться з /assets/js/config.js (window.MR_BARBER).
   ========================================================================= */
(function () {
  'use strict';

  var CFG = window.MR_BARBER || {};
  var BRAND = CFG.brand || {};
  var SERVICES = CFG.services || [];
  var CATEGORIES = CFG.serviceCategories || [];
  var MASTERS = CFG.masters || [];
  var BOOKING_CFG = CFG.booking || { slots: [], daysAhead: 7, storageKey: 'mrbarber.bookings.v1', profileKey: 'mrbarber.profile.v1' };
  var QUIZ = CFG.quiz || { steps: [], rules: [] };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function money(value) {
    return Number(value || 0).toLocaleString('uk-UA') + ' ₴';
  }

  function fmtDuration(min) {
    var m = Number(min || 0);
    var h = Math.floor(m / 60);
    var rest = m % 60;
    if (!h) return m + ' хв';
    return h + ' год' + (rest ? ' ' + rest + ' хв' : '');
  }

  function byId(id) {
    for (var i = 0; i < SERVICES.length; i += 1) {
      if (SERVICES[i].id === id) return SERVICES[i];
    }
    return null;
  }

  function masterById(id) {
    for (var i = 0; i < MASTERS.length; i += 1) {
      if (MASTERS[i].id === id) return MASTERS[i];
    }
    return null;
  }

  var ICONS = {
    scissors: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="6" cy="18" r="2.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="18" r="2.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 16 18 4M16 16 6 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    razor: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 20 20 4M14 4h6v6M4 14h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    spark: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 10.9 10.1 9 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    drop: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 3.5s6 6.1 6 10a6 6 0 0 1-12 0c0-3.9 6-10 6-10Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'
  };

  function icon(name) { return ICONS[name] || ICONS.spark; }

  /* Preloader, рік */
  var html = document.documentElement;
  html.classList.remove('no-js');

  var preloaderDone = false;
  var preloaderShownAt = Date.now();
  var PRELOADER_MIN_MS = 520;

  function hidePreloader() {
    if (preloaderDone) return;
    var elapsed = Date.now() - preloaderShownAt;
    if (elapsed < PRELOADER_MIN_MS) {
      window.setTimeout(hidePreloader, PRELOADER_MIN_MS - elapsed);
      return;
    }
    var pre = $('#preloader');
    if (!pre) { preloaderDone = true; return; }
    preloaderDone = true;
    pre.classList.add('is-done');
    pre.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () {
      pre.style.display = 'none';
    }, 380);
  }

  // Прелоадер — лише короткий брендовий штрих: 0.52–0.6 с, не більше.
  if (document.readyState === 'loading') {
    window.addEventListener('load', hidePreloader, { once: true });
    window.setTimeout(hidePreloader, 600);
  } else {
    hidePreloader();
  }

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header + mobile bar + меню */
  var header = $('#siteHeader');
  var mobileBar = $('#mobileBar');
  var mobileNav = $('#mobileNav');
  var menuToggle = $('#menuToggle');
  var menuClose = $('#menuClose');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    document.body.classList.toggle('is-scrolled', y > 24);
    if (mobileBar) mobileBar.classList.toggle('is-visible', y > 420);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function openMenu() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
  }

  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.booking-modal.is-open')) document.body.classList.remove('is-locked');
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (mobileNav) {
    mobileNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });
  }

  /* Reveal on scroll */
  var revealObserver = null;
  var revealDelayIndex = 0;

  function observeReveals(scope) {
    var items = $$('.reveal', scope || document);
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-in'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    items.forEach(function (item) {
      if (item.classList.contains('is-in') || item.dataset.revealBound === '1') return;
      item.dataset.revealBound = '1';
      item.style.transitionDelay = (revealDelayIndex % 4) * 60 + 'ms';
      revealDelayIndex += 1;
      revealObserver.observe(item);
    });
  }

  observeReveals(document);

  /* Cursor glow */
  var glow = $('#cursorGlow');
  var pointerFine = window.matchMedia('(pointer: fine)').matches;
  if (glow && pointerFine) {
    var gx = 0, gy = 0, gcx = 0, gcy = 0, glowRaf = 0;
    function glowTick() {
      gcx += (gx - gcx) * 0.12;
      gcy += (gy - gcy) * 0.12;
      glow.style.transform = 'translate3d(' + gcx + 'px,' + gcy + 'px,0)';
      glowRaf = window.requestAnimationFrame(glowTick);
    }
    document.addEventListener('mousemove', function (event) {
      gx = event.clientX;
      gy = event.clientY;
      glow.classList.add('is-on');
      if (!glowRaf) glowRaf = window.requestAnimationFrame(glowTick);
    });
  }

  /* Spotlight follow */
  $$('.spotlight').forEach(function (node) {
    node.addEventListener('pointermove', function (event) {
      var rect = node.getBoundingClientRect();
      var mx = ((event.clientX - rect.left) / rect.width) * 100;
      var my = ((event.clientY - rect.top) / rect.height) * 100;
      node.style.setProperty('--mx', mx.toFixed(1) + '%');
      node.style.setProperty('--my', my.toFixed(1) + '%');
    });
  });

  /* Tilt cards */
  if (pointerFine) {
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        card.classList.add('is-tilting');
        card.style.transform = 'perspective(900px) rotateY(' + (px * 4).toFixed(2) + 'deg) rotateX(' + (-py * 4).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* Marquee: дублюємо вміст для безшовного циклу */
  $$('.marquee-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* Smooth anchor scroll (sticky header offset) */
  function scrollToSection(target) {
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - 76;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      scrollToSection(target);
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Активна навігація */
  var watched = $$('.main-nav .nav-link').map(function (link) {
    return { link: link, section: document.querySelector(link.getAttribute('href')) };
  }).filter(function (item) { return item.section; });

  if ('IntersectionObserver' in window && watched.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        watched.forEach(function (item) {
          item.link.classList.toggle('is-active', item.section === entry.target);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    watched.forEach(function (item) { navObserver.observe(item.section); });
  }

  /* Toast */
  var toastEl = $('#toast');
  var toastTimer = 0;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 3400);
  }


  /* ---------------------------------------------------------------------
     КОНФІГУРАТОР ПОСЛУГ
     --------------------------------------------------------------------- */
  var selectedServices = [];
  var activeCategory = CATEGORIES.length ? CATEGORIES[0].id : 'hair';
  var tabsHost = $('#serviceTabs');
  var panelHost = $('#servicePanel');
  var summaryList = $('#summaryList');
  var summaryEmpty = $('#summaryEmpty');
  var summaryPrice = $('#summaryPrice');
  var summaryDuration = $('#summaryDuration');
  var summaryBook = $('#summaryBook');
  var selectedCount = $('#selectedCount');

  function categoryLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i += 1) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    }
    return 'Послуги';
  }

  function renderTabs() {
    if (!tabsHost) return;
    tabsHost.innerHTML = CATEGORIES.map(function (cat) {
      var count = SERVICES.filter(function (s) { return s.cat === cat.id; }).length;
      return '<button type="button" class="service-tab' + (cat.id === activeCategory ? ' is-active' : '') + '"' +
        ' role="tab" aria-selected="' + (cat.id === activeCategory) + '" data-cat="' + cat.id + '">' +
        icon(cat.icon) + '<span>' + esc(cat.label) + '</span>' +
        '<span class="service-tab-badge">' + esc(cat.badge || count) + '</span>' +
        '</button>';
    }).join('');
  }

  function renderPanel() {
    if (!panelHost) return;
    var list = SERVICES.filter(function (s) { return s.cat === activeCategory; });
    panelHost.innerHTML = list.map(function (s) {
      var checked = selectedServices.indexOf(s.id) !== -1;
      return '<label class="service-card' + (checked ? ' is-selected' : '') + '" data-service="' + s.id + '">' +
        '<input class="service-check" type="checkbox" value="' + s.id + '"' + (checked ? ' checked' : '') + ' aria-label="' + esc(s.name) + '">' +
        '<div class="service-card-body">' +
        '<div class="service-name-row"><span class="service-name">' + esc(s.name) + '</span>' +
        (s.badge ? '<span class="service-badge">' + esc(s.badge) + '</span>' : '') + '</div>' +
        '<p class="service-desc">' + esc(s.desc) + '</p></div>' +
        '<div class="service-meta"><span class="service-price">' + money(s.price) + '</span>' +
        '<span class="service-duration">' + fmtDuration(s.duration) + '</span></div>' +
        '</label>';
    }).join('');
  }

  function selectedTotals() {
    var price = 0;
    var duration = 0;
    selectedServices.forEach(function (id) {
      var s = byId(id);
      if (!s) return;
      price += s.price;
      duration += s.duration;
    });
    return { price: price, duration: duration };
  }

  function renderSummary() {
    var totals = selectedTotals();
    if (summaryPrice) summaryPrice.textContent = money(totals.price);
    if (summaryDuration) summaryDuration.textContent = fmtDuration(totals.duration);
    if (selectedCount) selectedCount.textContent = selectedServices.length + ' обрано';
    if (summaryEmpty) summaryEmpty.style.display = selectedServices.length ? 'none' : 'block';

    if (summaryList) {
      summaryList.innerHTML = selectedServices.map(function (id) {
        var s = byId(id);
        if (!s) return '';
        return '<li class="summary-item">' +
          '<div class="summary-item-main"><p class="summary-item-name">' + esc(s.name) + '</p>' +
          '<p class="summary-item-meta">' + fmtDuration(s.duration) + ' · ' + esc(categoryLabel(s.cat)) + '</p></div>' +
          '<span class="summary-item-price">' + money(s.price) + '</span>' +
          '<button type="button" class="summary-remove" data-remove="' + s.id + '" aria-label="Прибрати">×</button>' +
          '</li>';
      }).join('');
    }

    if (summaryBook) {
      summaryBook.disabled = !selectedServices.length;
      summaryBook.textContent = selectedServices.length ? 'Записатись · ' + money(totals.price) : 'Оберіть послугу';
    }
  }

  function toggleService(id, force) {
    var has = selectedServices.indexOf(id) !== -1;
    var want = typeof force === 'boolean' ? force : !has;
    if (want && !has) selectedServices.push(id);
    if (!want && has) selectedServices = selectedServices.filter(function (item) { return item !== id; });
    renderPanel();
    renderSummary();
  }


  if (tabsHost) {
    tabsHost.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-cat]');
      if (!tab) return;
      activeCategory = tab.getAttribute('data-cat');
      renderTabs();
      renderPanel();
    });
  }

  if (panelHost) {
    panelHost.addEventListener('change', function (event) {
      var input = event.target.closest('.service-check');
      if (!input) return;
      toggleService(input.value, input.checked);
    });
  }

  if (summaryList) {
    summaryList.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-remove]');
      if (!btn) return;
      toggleService(btn.getAttribute('data-remove'), false);
    });
  }

  if (summaryBook) {
    summaryBook.addEventListener('click', function () {
      if (!selectedServices.length) return;
      openBooking({ services: selectedServices.slice() });
    });
  }

  function gotoService(id) {
    var service = byId(id);
    if (!service) return;
    activeCategory = service.cat;
    if (selectedServices.indexOf(id) === -1) {
      selectedServices.push(id);
      renderSummary();
    }
    renderTabs();
    renderPanel();
    scrollToSection($('#services'));
    window.setTimeout(function () {
      var card = $('[data-service="' + id + '"]');
      if (card) card.classList.add('is-selected');
    }, 520);
  }

  $$('[data-goto-service]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      closeMenu();
      gotoService(link.getAttribute('data-goto-service'));
    });
  });

  renderTabs();
  renderPanel();
  renderSummary();

  /* ---------------------------------------------------------------------
     КВІЗ: 3 кроки → рекомендація
     --------------------------------------------------------------------- */
  var quizBody = $('#quizBody');
  var quizProgress = $('#quizProgressBar');
  var quizStepLabel = $('#quizStepLabel');
  var quizIndex = 0;
  var quizAnswers = {};
  var quizResult = null;

  function quizStepCount() { return (QUIZ.steps || []).length; }

  function rulesMatch(rule) {
    var when = rule.when || {};
    var keys = Object.keys(when);
    for (var i = 0; i < keys.length; i += 1) {
      if (quizAnswers[keys[i]] !== when[keys[i]]) return false;
    }
    return true;
  }

  function resolveQuiz() {
    var rules = QUIZ.rules || [];
    for (var i = 0; i < rules.length; i += 1) {
      if (rulesMatch(rules[i])) return rules[i];
    }
    return null;
  }

  function renderQuizResult() {
    if (!quizBody) return;
    quizResult = resolveQuiz();
    if (!quizResult) {
      quizBody.innerHTML = '<div class="quiz-result"><p class="quiz-result-title">Не вдалося підібрати сет</p>' +
        '<p class="quiz-result-text">Спробуйте інші відповіді або оберіть послугу вручну.</p></div>';
      return;
    }
    var services = (quizResult.services || []).map(byId).filter(Boolean);
    var price = services.reduce(function (sum, s) { return sum + s.price; }, 0);
    var duration = services.reduce(function (sum, s) { return sum + s.duration; }, 0);
    var master = masterById(quizResult.master || 'any');

    quizBody.innerHTML = '<div class="quiz-result">' +
      '<p class="quiz-result-eyebrow">Ваша рекомендація</p>' +
      '<h3 class="quiz-result-title">' + esc(quizResult.title) + '</h3>' +
      '<p class="quiz-result-text">' + esc(quizResult.text) + '</p>' +
      '<div class="quiz-result-meta">' +
      '<div><span>Майстер</span><strong>' + esc(master ? master.name : 'Будь-який майстер') + '</strong></div>' +
      '<div><span>Послуги</span><strong>' + esc(services.map(function (s) { return s.name; }).join(' + ') || 'Стрижка') + '</strong></div>' +
      '<div><span>Орієнтовно</span><strong>' + money(price) + '</strong></div>' +
      '<div><span>Час у кріслі</span><strong>' + fmtDuration(duration) + '</strong></div>' +
      '</div>' +
      '<div class="quiz-result-actions">' +
      '<button type="button" class="btn btn-gold btn-sm" data-quiz-book>Записатись із цим сетом</button>' +
      '<a href="#services" class="btn btn-ghost btn-sm" data-quiz-manual>Подивитись прайс</a>' +
      '</div>' +
      '<button type="button" class="quiz-restart" data-quiz-restart>Пройти заново</button>' +
      '</div>';

    if (quizProgress) quizProgress.style.width = '100%';
    if (quizStepLabel) quizStepLabel.textContent = 'Готово';
  }

  function renderQuizStep() {
    if (!quizBody) return;
    var steps = QUIZ.steps || [];
    var step = steps[quizIndex];
    if (!step) { renderQuizResult(); return; }
    var total = steps.length;
    if (quizProgress) quizProgress.style.width = ((quizIndex + 1) / total * 100).toFixed(2) + '%';
    if (quizStepLabel) quizStepLabel.textContent = 'Крок ' + (quizIndex + 1) + ' із ' + total;

    quizBody.innerHTML = '<div class="quiz-question">' +
      '<h3 class="quiz-q-title">' + esc(step.title) + '</h3>' +
      '<p class="quiz-q-sub">' + esc(step.subtitle || '') + '</p>' +
      '<div class="quiz-options">' + step.options.map(function (opt) {
        var active = quizAnswers[step.id] === opt.value;
        return '<button type="button" class="quiz-option' + (active ? ' is-selected' : '') + '" data-quiz-value="' + esc(opt.value) + '">' +
          '<span><span class="quiz-option-label">' + esc(opt.label) + '</span>' +
          (opt.hint ? '<span class="quiz-option-hint">' + esc(opt.hint) + '</span>' : '') + '</span>' +
          '<svg class="quiz-option-arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>';
      }).join('') + '</div>' +
      (quizIndex > 0 ? '<button type="button" class="quiz-back" data-quiz-back>← Назад</button>' : '') +
      '</div>';
  }


  if (quizBody) {
    quizBody.addEventListener('click', function (event) {
      var option = event.target.closest('[data-quiz-value]');
      if (option) {
        var steps = QUIZ.steps || [];
        var step = steps[quizIndex];
        if (!step) return;
        quizAnswers[step.id] = option.getAttribute('data-quiz-value');
        if (quizIndex < steps.length - 1) {
          quizIndex += 1;
          renderQuizStep();
        } else {
          renderQuizResult();
        }
        return;
      }
      if (event.target.closest('[data-quiz-back]')) {
        if (quizIndex > 0) {
          quizIndex -= 1;
          renderQuizStep();
        }
        return;
      }
      if (event.target.closest('[data-quiz-restart]')) {
        quizIndex = 0;
        quizAnswers = {};
        quizResult = null;
        renderQuizStep();
        return;
      }
      if (event.target.closest('[data-quiz-book]') && quizResult) {
        openBooking({
          services: (quizResult.services || []).slice(),
          master: quizResult.master || 'any'
        });
        return;
      }
      if (event.target.closest('[data-quiz-manual]')) {
        var ids = (quizResult && quizResult.services) || [];
        ids.forEach(function (id) {
          if (selectedServices.indexOf(id) === -1) selectedServices.push(id);
        });
        renderSummary();
        renderPanel();
      }
    });
  }

  renderQuizStep();

  /* ---------------------------------------------------------------------
     КОМАНДА + ТЕМИ ВІДГУКІВ
     --------------------------------------------------------------------- */
  var teamGrid = $('#teamGrid');
  if (teamGrid) {
    teamGrid.innerHTML = MASTERS.map(function (m) {
      var any = m.any ? ' team-card-any' : '';
      var avatar = m.photo
        ? '<div class="team-avatar team-avatar--photo">' +
            '<picture>' +
              (m.photoWebp ? '<source type="image/webp" srcset="' + esc(m.photoWebp) + '">' : '') +
              '<img src="' + esc(m.photo) + '" alt="' + esc(m.photoAlt || m.name) + '" width="600" height="750" loading="lazy" decoding="async">' +
            '</picture>' +
          '</div>'
        : '<div class="team-avatar">' + esc(m.initials || '★') + '</div>';
      return '<article class="team-card reveal' + any + '">' +
        avatar +
        '<p class="team-role">' + esc(m.role) + '</p>' +
        '<h3 class="team-name">' + esc(m.name) + '</h3>' +
        '<p class="team-note">' + esc(m.note) + '</p>' +
        '<div class="team-tags">' + (m.tags || []).map(function (tag) {
          return '<span>' + esc(tag) + '</span>';
        }).join('') + '</div>' +
        '<button type="button" class="team-cta" data-open-booking data-master="' + m.id + '">Обрати майстра' +
        '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '</article>';
    }).join('');
    observeReveals(teamGrid);
  }
  var themesHost = $('#reviewThemes');
  if (themesHost) {
    themesHost.innerHTML = (CFG.reviewThemes || []).map(function (theme, index) {
      return '<article class="review-theme reveal">' +
        '<p class="review-theme-index">' + (index < 9 ? '0' + (index + 1) : index + 1) + '</p>' +
        '<div class="review-theme-icon" aria-hidden="true">' + icon(theme.icon) + '</div>' +
        '<p class="review-theme-stars" aria-hidden="true">★★★★★</p>' +
        '<h3>' + esc(theme.title) + '</h3>' +
        '<p>' + esc(theme.text) + '</p>' +
        '</article>';
    }).join('');
    observeReveals(themesHost);
  }



  /* ---------------------------------------------------------------------
     ОНЛАЙН-ЗАПИС (4 кроки)
     --------------------------------------------------------------------- */
  var MONTHS_GEN = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  var MONTHS_SHORT = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
  var DAYS_SHORT = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var STEPS = ['Майстер', 'Послуги', 'Час', 'Контакти'];

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function dateKey(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function parseKey(key) {
    var parts = String(key || '').split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function humanDate(key) {
    var d = parseKey(key);
    if (isNaN(d.getTime())) return '';
    return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + ', ' + DAYS_SHORT[d.getDay()];
  }

  function buildDates() {
    var out = [];
    var ahead = Number(BOOKING_CFG.daysAhead || 7);
    var today = new Date();
    for (var i = 0; i < ahead; i += 1) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      out.push({
        key: dateKey(d),
        day: i === 0 ? 'Сьогодні' : DAYS_SHORT[d.getDay()],
        num: d.getDate(),
        month: MONTHS_SHORT[d.getMonth()]
      });
    }
    return out;
  }

  function readStore(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* приватний режим — просто ігноруємо */
    }
  }

  function allBookings() {
    return readStore(BOOKING_CFG.storageKey || 'mrbarber.bookings.v1');
  }

  function servicesInfo(ids) {
    var list = (ids || []).map(byId).filter(Boolean);
    return {
      list: list,
      price: list.reduce(function (sum, s) { return sum + s.price; }, 0),
      duration: list.reduce(function (sum, s) { return sum + s.duration; }, 0)
    };
  }

  function slotBusy(date, time, master) {
    return allBookings().some(function (item) {
      if (item.date !== date || item.time !== time) return false;
      if (!master || master === 'any') return true;
      return item.master === master || item.master === 'any';
    });
  }

  function Wizard(host) {
    this.host = host;
    this.dates = buildDates();
    this.state = {
      step: 1,
      master: 'any',
      services: [],
      date: this.dates.length ? this.dates[0].key : '',
      time: '',
      name: '',
      phone: '',
      note: '',
      consent: false,
      done: false,
      code: ''
    };
    var profile = readStore(BOOKING_CFG.profileKey || 'mrbarber.profile.v1')[0];
    if (profile && profile.name) this.state.name = profile.name;
    if (profile && profile.phone) this.state.phone = profile.phone;
    this.render();
  }

  Wizard.prototype.info = function () {
    return servicesInfo(this.state.services);
  };

  Wizard.prototype.masterName = function () {
    var m = masterById(this.state.master);
    return m ? m.name : 'Будь-який вільний майстер';
  };

  Wizard.prototype.steps = function () {
    var self = this;
    return '<div class="bw-steps">' + STEPS.map(function (label, index) {
      var num = index + 1;
      var cls = 'bw-step';
      if (self.state.step === num) cls += ' is-active';
      if (self.state.step > num && !self.state.done) cls += ' is-done';
      return '<div class="' + cls + '"><span class="bw-step-num">0' + num + '</span>' +
        '<span class="bw-step-name">' + label + '</span></div>';
    }).join('') + '</div>';
  };

  Wizard.prototype.stepMaster = function () {
    var self = this;
    return '<div class="bw-pane"><div class="bw-pane-head">' +
      '<h3 class="bw-title">Крок 1 · Оберіть майстра</h3>' +
      '<p class="bw-sub">Можна обрати конкретного барбера або залишити вибір нам.</p></div>' +
      '<div class="bw-masters">' + MASTERS.map(function (m) {
        return '<button type="button" class="bw-master' + (self.state.master === m.id ? ' is-active' : '') + '" data-bw-master="' + m.id + '">' +
          '<span class="bw-avatar">' + esc(m.initials || '★') + '</span>' +
          '<span><span class="bw-master-name">' + esc(m.name) + '</span>' +
          '<span class="bw-master-role">' + esc(m.role) + '</span></span>' +
          '</button>';
      }).join('') + '</div>' +
      '<div class="bw-foot"><p class="bw-total">Разом<strong>' + money(this.info().price) + '</strong></p>' +
      '<div class="bw-nav"><button type="button" class="btn btn-gold btn-sm" data-bw-next>Далі</button></div></div></div>';
  };

  Wizard.prototype.stepServices = function () {
    var self = this;
    return '<div class="bw-pane"><div class="bw-pane-head">' +
      '<h3 class="bw-title">Крок 2 · Послуги</h3>' +
      '<p class="bw-sub">Позначте все, що потрібно. Час і вартість порахуємо автоматично.</p></div>' +
      '<div class="bw-services">' + SERVICES.map(function (s) {
        var active = self.state.services.indexOf(s.id) !== -1;
        return '<label class="bw-service' + (active ? ' is-active' : '') + '">' +
          '<input type="checkbox" value="' + s.id + '"' + (active ? ' checked' : '') + '>' +
          '<span><span class="bw-service-name">' + esc(s.name) + '</span>' +
          '<span class="bw-service-dur">' + fmtDuration(s.duration) + '</span></span>' +
          '<span class="bw-service-price">' + money(s.price) + '</span></label>';
      }).join('') + '</div>' +
      '<div class="bw-foot"><p class="bw-total">Разом<strong>' + money(this.info().price) + '</strong></p>' +
      '<div class="bw-nav"><button type="button" class="btn btn-ghost btn-sm" data-bw-back>Назад</button>' +
      '<button type="button" class="btn btn-gold btn-sm" data-bw-next>Далі</button></div></div></div>';
  };

  Wizard.prototype.stepTime = function () {
    var self = this;
    var slots = BOOKING_CFG.slots || [];
    return '<div class="bw-pane"><div class="bw-pane-head">' +
      '<h3 class="bw-title">Крок 3 · Дата та час</h3>' +
      '<p class="bw-sub">Вільні слоти на найближчі ' + this.dates.length + ' днів. Заняті позначені сірим.</p></div>' +
      '<div class="bw-dates">' + this.dates.map(function (d) {
        return '<button type="button" class="bw-date' + (self.state.date === d.key ? ' is-active' : '') + '" data-bw-date="' + d.key + '">' +
          '<span class="bw-date-day">' + d.day + '</span>' +
          '<span class="bw-date-num">' + d.num + '</span>' +
          '<span class="bw-date-month">' + d.month + '</span></button>';
      }).join('') + '</div>' +
      '<div class="bw-slots">' + slots.map(function (time) {
        var busy = slotBusy(self.state.date, time, self.state.master);
        return '<button type="button" class="bw-slot' + (self.state.time === time && !busy ? ' is-active' : '') + '"' +
          (busy ? ' disabled aria-disabled="true"' : '') + ' data-bw-time="' + time + '">' + time + '</button>';
      }).join('') + '</div>' +
      '<div class="bw-foot"><p class="bw-total">Разом<strong>' + money(this.info().price) + '</strong>' +
      '<span class="bw-total-duration">' + fmtDuration(this.info().duration) + '</span></p>' +
      '<div class="bw-nav"><button type="button" class="btn btn-ghost btn-sm" data-bw-back>Назад</button>' +
      '<button type="button" class="btn btn-gold btn-sm" data-bw-next>Далі</button></div></div></div>';
  };


  Wizard.prototype.stepContact = function () {
    var st = this.state;
    var info = this.info();
    return '<div class="bw-pane"><div class="bw-pane-head">' +
      '<h3 class="bw-title">Крок 4 · Підтвердження</h3>' +
      '<p class="bw-sub">Залиште контакти — адміністратор підтвердить запис у Telegram або дзвінком.</p></div>' +
      '<div class="bw-review">' +
      '<div class="bw-review-row"><span>Майстер</span><strong>' + esc(this.masterName()) + '</strong></div>' +
      '<div class="bw-review-row"><span>Послуги</span><strong>' + esc(info.list.map(function (s) { return s.name; }).join(', ') || '—') + '</strong></div>' +
      '<div class="bw-review-row"><span>Коли</span><strong>' + esc(humanDate(st.date) + (st.time ? ', ' + st.time : '')) + '</strong></div>' +
      '<div class="bw-review-row"><span>Тривалість</span><strong>' + fmtDuration(info.duration) + '</strong></div>' +
      '<div class="bw-review-row"><span>До сплати</span><strong>' + money(info.price) + '</strong></div>' +
      '</div>' +
      '<form class="bw-form" novalidate>' +
      '<div class="bw-fields">' +
      '<div class="bw-field"><label class="bw-label" for="bwName">Ім’я</label>' +
      '<input class="bw-input" id="bwName" name="name" type="text" autocomplete="name" placeholder="Як до вас звертатися" value="' + esc(st.name) + '"></div>' +
      '<div class="bw-field"><label class="bw-label" for="bwPhone">Телефон</label>' +
      '<input class="bw-input" id="bwPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+38 (0__) ___-__-__" value="' + esc(st.phone) + '"></div>' +
      '<div class="bw-field bw-field--full"><label class="bw-label" for="bwNote">Коментар (необов’язково)</label>' +
      '<textarea class="bw-input" id="bwNote" name="note" rows="2" placeholder="Побажання, «перший раз у барбера»">' + esc(st.note) + '</textarea></div>' +
      '</div>' +
      '<label class="bw-check"><input type="checkbox" name="consent"' + (st.consent ? ' checked' : '') + '>' +
      '<span>Погоджуюсь на обробку даних для підтвердження запису.</span></label>' +
      '<p class="bw-error" data-bw-error role="alert"></p>' +
      '<div class="bw-foot"><p class="bw-total">До сплати<strong>' + money(info.price) + '</strong></p>' +
      '<div class="bw-nav"><button type="button" class="btn btn-ghost btn-sm" data-bw-back>Назад</button>' +
      '<button type="submit" class="btn btn-gold btn-sm">Підтвердити запис</button></div></div>' +
      '</form></div>';
  };

  Wizard.prototype.stepSuccess = function () {
    var st = this.state;
    var info = this.info();
    return '<div class="bw-success">' +
      '<span class="bw-success-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 12.5 9.5 18 20 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<h4>Запис прийнято</h4>' +
      '<p>' + esc(st.name || 'Друже') + ', чекаємо вас ' + esc(humanDate(st.date)) + ' о ' + esc(st.time) + '. ' +
      'Адміністратор зв’яжеться за номером ' + esc(st.phone) + ' для підтвердження.</p>' +
      '<div class="bw-success-list">' +
      '<span>Код запису</span><strong>' + esc(st.code) + '</strong>' +
      '<span>Послуги</span><strong>' + esc(info.list.map(function (s) { return s.name; }).join(', ')) + '</strong>' +
      '<span>Сума</span><strong>' + money(info.price) + '</strong>' +
      '</div>' +
      '<div class="bw-success-actions">' +
      '<button type="button" class="btn btn-gold btn-sm" data-open-mybookings>Мої записи</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-bw-reset>Новий запис</button>' +
      '</div>' +
      '<p class="bw-success-hint">Запис збережено у цьому браузері. Скасувати можна за телефоном ' + esc(BRAND.phoneDisplay || '') + '.</p>' +
      '</div>';
  };

  Wizard.prototype.render = function () {
    if (!this.host) return;
    var body;
    if (this.state.done) {
      body = this.stepSuccess();
    } else if (this.state.step === 1) {
      body = this.stepMaster();
    } else if (this.state.step === 2) {
      body = this.stepServices();
    } else if (this.state.step === 3) {
      body = this.stepTime();
    } else {
      body = this.stepContact();
    }
    this.host.innerHTML = this.steps() + body;
  };

  Wizard.prototype.next = function () {
    var s = this.state;
    if (s.step === 1) {
      s.step = 2;
    } else if (s.step === 2) {
      if (!s.services.length) { toast('Оберіть хоча б одну послугу'); return; }
      s.step = 3;
    } else if (s.step === 3) {
      if (!s.date || !s.time) { toast('Оберіть дату та час'); return; }
      s.step = 4;
    }
    this.render();
    if (s.step === 4) {
      var nameInput = $('#bwName', this.host);
      if (nameInput) nameInput.focus({ preventScroll: true });
    }
  };

  Wizard.prototype.reset = function () {
    var keepName = this.state.name;
    var keepPhone = this.state.phone;
    this.dates = buildDates();
    this.state = {
      step: 1,
      master: 'any',
      services: [],
      date: this.dates.length ? this.dates[0].key : '',
      time: '',
      name: keepName,
      phone: keepPhone,
      note: '',
      consent: false,
      done: false,
      code: ''
    };
    this.render();
  };

  Wizard.prototype.apply = function (options) {
    var opts = options || {};
    if (opts.master && masterById(opts.master)) this.state.master = opts.master;
    if (opts.services && opts.services.length) {
      var valid = opts.services.filter(function (id) { return !!byId(id); });
      if (valid.length) {
        this.state.services = valid.slice();
        this.state.step = 3;
      }
    }
    if (opts.date) this.state.date = opts.date;
    if (opts.time) this.state.time = opts.time;
    this.state.done = false;
    this.render();
  };

  function formatPhone(value) {
    var digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.indexOf('380') === 0) digits = digits.slice(2);
    else if (digits.charAt(0) === '0') digits = '38' + digits;
    else if (digits.indexOf('38') !== 0) digits = '38' + digits;
    digits = digits.slice(0, 12);
    var rest = digits.slice(2);
    var out = '+38';
    if (rest.length) out += ' (' + rest.slice(0, 3);
    if (rest.length >= 3) out += ')';
    if (rest.length > 3) out += ' ' + rest.slice(3, 6);
    if (rest.length > 6) out += '-' + rest.slice(6, 8);
    if (rest.length > 8) out += '-' + rest.slice(8, 10);
    return out;
  }

  Wizard.prototype.bind = function () {
    var self = this;
    var host = this.host;
    if (!host || host.getAttribute('data-bound') === '1') return;
    host.setAttribute('data-bound', '1');

    host.addEventListener('click', function (event) {
      var target = event.target;
      var masterBtn = target.closest('[data-bw-master]');
      if (masterBtn) {
        self.state.master = masterBtn.getAttribute('data-bw-master');
        self.state.time = '';
        self.render();
        return;
      }
      var dateBtn = target.closest('[data-bw-date]');
      if (dateBtn) {
        self.state.date = dateBtn.getAttribute('data-bw-date');
        self.state.time = '';
        self.render();
        return;
      }
      var slotBtn = target.closest('[data-bw-time]');
      if (slotBtn) {
        if (slotBtn.disabled) return;
        self.state.time = slotBtn.getAttribute('data-bw-time');
        self.render();
        return;
      }
      if (target.closest('[data-bw-next]')) { self.next(); return; }
      if (target.closest('[data-bw-back]')) {
        self.state.step = Math.max(1, self.state.step - 1);
        self.render();
        return;
      }
      if (target.closest('[data-bw-reset]')) self.reset();
    });

    host.addEventListener('change', function (event) {
      var input = event.target;
      if (input.matches('.bw-service input[type="checkbox"]')) {
        var id = input.value;
        if (input.checked) {
          if (self.state.services.indexOf(id) === -1) self.state.services.push(id);
        } else {
          self.state.services = self.state.services.filter(function (item) { return item !== id; });
        }
        self.render();
        return;
      }
      if (input.name === 'consent') self.state.consent = input.checked;
    });

    host.addEventListener('input', function (event) {
      var input = event.target;
      if (input.name === 'phone') {
        var atEnd = input.selectionStart === input.value.length;
        var formatted = formatPhone(input.value);
        input.value = formatted;
        self.state.phone = formatted;
        if (atEnd && input.setSelectionRange) input.setSelectionRange(formatted.length, formatted.length);
      } else if (input.name === 'name') {
        self.state.name = input.value;
      } else if (input.name === 'note') {
        self.state.note = input.value;
      }
    });

    host.addEventListener('submit', function (event) {
      event.preventDefault();
      self.submit();
    });
  };

  Wizard.prototype.submit = function () {
    var s = this.state;
    var errorEl = $('[data-bw-error]', this.host);
    function fail(message) {
      if (errorEl) errorEl.textContent = message;
      toast(message);
    }
    var name = String(s.name || '').trim();
    var digits = String(s.phone || '').replace(/\D/g, '');
    if (name.length < 2) { fail('Вкажіть ім’я — мінімум 2 літери'); return; }
    if (digits.length !== 12) { fail('Перевірте телефон у форматі +38 (0XX) XXX-XX-XX'); return; }
    if (!s.consent) { fail('Потрібна згода на обробку даних'); return; }
    if (!s.date || !s.time || !s.services.length) { fail('Заповніть усі кроки запису'); return; }

    var info = this.info();
    var entry = {
      code: 'MB-' + String(Date.now()).slice(-5),
      master: s.master,
      services: s.services.slice(),
      date: s.date,
      time: s.time,
      name: name,
      phone: s.phone,
      note: String(s.note || '').trim(),
      price: info.price,
      duration: info.duration,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    var list = allBookings();
    list.unshift(entry);
    writeStore(BOOKING_CFG.storageKey || 'mrbarber.bookings.v1', list.slice(0, 40));
    writeStore(BOOKING_CFG.profileKey || 'mrbarber.profile.v1', [{ name: name, phone: s.phone }]);

    s.done = true;
    s.code = entry.code;
    this.render();
    renderMyBookings();
    toast('Запис створено · ' + entry.code);
  };


  /* ---------------------------------------------------------------------
     МОЇ ЗАПИСИ
     --------------------------------------------------------------------- */
  var myBookingsBody = $('#myBookingsBody');
  var myBookingsCount = $('#myBookingsCount');

  function renderMyBookings() {
    var list = allBookings();
    if (myBookingsCount) myBookingsCount.textContent = String(list.filter(function (item) {
      return item.status !== 'cancelled';
    }).length);
    if (!myBookingsBody) return;
    if (!list.length) {
      myBookingsBody.innerHTML = '<div class="mybookings-empty"><p>Тут з’являться ваші записи, зроблені на цьому пристрої.<br>Перший візит — найкращий привід почати.</p>' +
        '<button type="button" class="btn btn-gold btn-sm" data-open-booking>Записатись</button></div>';
      return;
    }
    myBookingsBody.innerHTML = '<div class="mybookings">' + list.map(function (item) {
      var info = servicesInfo(item.services);
      var master = masterById(item.master);
      var cancelled = item.status === 'cancelled';
      return '<article class="mybooking">' +
        '<div><p class="mybooking-date">' + esc(humanDate(item.date)) + ' · ' + esc(item.time) + '</p>' +
        '<p class="mybooking-title">' + esc(info.list.map(function (s) { return s.name; }).join(', ') || 'Послуги') + '</p>' +
        '<p class="mybooking-meta">' + esc(master ? master.name : 'Будь-який майстер') + ' · ' + esc(item.code) +
        ' · ' + (cancelled ? 'Скасовано' : 'Очікує підтвердження') + '</p></div>' +
        '<div class="mybooking-side"><p class="mybooking-price">' + money(item.price) + '</p>' +
        (cancelled ? '' : '<button type="button" class="mybooking-cancel" data-cancel-booking="' + esc(item.code) + '">Скасувати</button>') +
        '</div></article>';
    }).join('') + '</div>';
  }

  function cancelBooking(code) {
    var list = allBookings().map(function (item) {
      if (item.code === code) item.status = 'cancelled';
      return item;
    });
    writeStore(BOOKING_CFG.storageKey || 'mrbarber.bookings.v1', list);
    renderMyBookings();
    if (modalWizard) modalWizard.render();
    if (inlineWizard) inlineWizard.render();
    toast('Запис ' + code + ' скасовано');
  }

  /* ---------------------------------------------------------------------
     МОДАЛКИ + ЗАПУСК ВІДЖЕТІВ
     --------------------------------------------------------------------- */
  var bookingModal = $('#bookingModal');
  var myBookingsModal = $('#myBookingsModal');
  var inlineMount = $('[data-booking-mount="inline"]');
  var modalMount = $('[data-booking-mount="modal"]');
  var inlineWizard = null;
  var modalWizard = null;

  function openModal(node) {
    if (!node) return;
    node.classList.add('is-open');
    node.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    window.setTimeout(function () {
      var focusable = node.querySelector('.booking-modal-panel button, .booking-modal-panel input, .booking-modal-panel a');
      if (focusable) focusable.focus({ preventScroll: true });
    }, 140);
  }

  function closeModal(node) {
    if (!node) return;
    node.classList.remove('is-open');
    node.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.booking-modal.is-open') && !document.querySelector('.mobile-nav.is-open')) {
      document.body.classList.remove('is-locked');
    }
  }

  function openBooking(options) {
    var opts = options || {};
    if (!opts.services && bookingModal && modalWizard) modalWizard.state.step = 1;
    if (modalWizard) {
      modalWizard.apply(opts);
      openModal(bookingModal);
      return;
    }
    if (inlineWizard) {
      inlineWizard.apply(opts);
      scrollToSection($('#booking'));
    }
  }

  function openCrmWidget() {
    if (!BRAND.crmWidgetUrl) {
      toast('Календар тимчасово недоступний — телефонуйте ' + (BRAND.phoneDisplay || ''));
      return;
    }
    if (!document.getElementById('helperCrmWidget')) {
      var script = document.createElement('script');
      script.id = 'helperCrmWidget';
      script.src = BRAND.crmWidgetUrl;
      script.async = true;
      script.onerror = function () {
        toast('Календар недоступний. Телефон: ' + (BRAND.phoneDisplay || ''));
      };
      document.body.appendChild(script);
      toast('Відкриваємо офіційний календар HelperCRM…');
      window.setTimeout(function () {
        if (!document.querySelector('iframe[src*="helpercrm"], .helpercrm, [id*="helpercrm"]')) {
          toast('Якщо вікно не з’явилось, дозвольте спливаючі вікна або телефонуйте ' + (BRAND.phoneDisplay || ''));
        }
      }, 3000);
    }
  }

  if (inlineMount) {
    inlineWizard = new Wizard(inlineMount);
    inlineWizard.bind();
  }
  if (modalMount) {
    modalWizard = new Wizard(modalMount);
    modalWizard.bind();
  }
  renderMyBookings();

  document.addEventListener('click', function (event) {
    var target = event.target;
    var bookBtn = target.closest('[data-open-booking]');
    if (bookBtn) {
      event.preventDefault();
      closeMenu();
      openBooking({
        master: bookBtn.getAttribute('data-master') || undefined,
        time: bookBtn.getAttribute('data-time') || undefined
      });
      return;
    }
    if (target.closest('[data-open-mybookings]') || target.closest('#openMyBookings')) {
      event.preventDefault();
      closeMenu();
      renderMyBookings();
      openModal(myBookingsModal);
      return;
    }
    if (target.closest('[data-close-booking]')) { closeModal(bookingModal); return; }
    if (target.closest('[data-close-mybookings]')) { closeModal(myBookingsModal); return; }
    if (target.closest('[data-open-crm]')) { event.preventDefault(); openCrmWidget(); return; }
    var cancelBtn = target.closest('[data-cancel-booking]');
    if (cancelBtn) cancelBooking(cancelBtn.getAttribute('data-cancel-booking'));
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (myBookingsModal && myBookingsModal.classList.contains('is-open')) closeModal(myBookingsModal);
    else if (bookingModal && bookingModal.classList.contains('is-open')) closeModal(bookingModal);
    else closeMenu();
  });

  /* ---------------------------------------------------------------------
     GSAP: делікатний вступ hero (якщо бібліотека завантажена)
     --------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      var heroBits = $$('.hero-kicker, .hero-title, .hero-sub, .hero-actions, .hero-stats');
      if (heroBits.length) {
        window.gsap.from(heroBits, {
          y: 28,
          opacity: 0,
          duration: 0.95,
          stagger: 0.09,
          ease: 'power3.out',
          delay: 0.2,
          clearProps: 'transform,opacity'
        });
      }
      var heroVisual = $('.hero-visual');
      if (heroVisual) {
        window.gsap.from(heroVisual, {
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.35,
          clearProps: 'transform,opacity'
        });
      }
    }
  }

  /* ---------------------------------------------------------------------
     ПОРІВНЯННЯ «БУЛО / СТАЛО»
     «Було» — жива копія старої сторінки mrbarber.com.ua,
     «Стало» — ця версія. Стан зберігається у localStorage.
     --------------------------------------------------------------------- */
  var viewNew = $('#viewNew');
  var viewOld = $('#viewOld');
  var compareDock = $('#compareDock');
  var compareHint = $('#compareHint');
  var viewAnnounce = $('#viewAnnounce');
  var VIEW_KEY = 'mrbarber.view.v1';
  var HINT_KEY = 'mrbarber.compareHint.v1';

  function setView(mode, silent) {
    if (!viewNew || !viewOld) return;
    var isOld = mode === 'old';
    viewNew.hidden = isOld;
    viewOld.hidden = !isOld;
    document.documentElement.classList.toggle('is-view-old', isOld);
    if (compareDock) compareDock.classList.toggle('is-old', isOld);

    $$('.compare-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-view') === (isOld ? 'old' : 'new');
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (viewAnnounce) {
      viewAnnounce.textContent = isOld
        ? 'Показано версію «Було» — сайт до редизайну.'
        : 'Показано версію «Стало» — оновлений сайт Mr. BARBER.';
    }

    try { window.localStorage.setItem(VIEW_KEY, isOld ? 'old' : 'new'); } catch (err) { /* приватний режим */ }

    if (!silent) window.scrollTo(0, 0);
    if (!isOld && window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function dismissHint() {
    if (!compareHint) return;
    compareHint.classList.add('is-hidden');
    try { window.sessionStorage.setItem(HINT_KEY, '1'); } catch (err) { /* ignore */ }
  }

  $$('[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setView(btn.getAttribute('data-view') === 'old' ? 'old' : 'new');
      dismissHint();
    });
  });

  if (compareHint) {
    var hintDismissed = false;
    try { hintDismissed = window.sessionStorage.getItem(HINT_KEY) === '1'; } catch (err) { hintDismissed = false; }
    if (hintDismissed) {
      compareHint.classList.add('is-hidden');
    } else {
      window.setTimeout(dismissHint, 9000);
    }
    compareHint.addEventListener('click', dismissHint);
  }

  var initialView = 'new';
  try {
    var storedView = window.localStorage.getItem(VIEW_KEY);
    if (storedView === 'old' || storedView === 'new') initialView = storedView;
  } catch (err) { initialView = 'new'; }
  if (window.location.search.indexOf('view=old') !== -1) initialView = 'old';
  setView(initialView, true);

  console.info('%cMr. BARBER', 'color:#d4af37;font-weight:700', '— інтерфейс готовий. Запис: #booking');
})();


