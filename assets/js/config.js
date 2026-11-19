/* =========================================================================
   Mr. BARBER — єдиний файл налаштувань.
   Тут редагуються ціни, тривалість, майстри, слоти та контакти.
   Реальні дані бренду зібрані з mrbarber.com.ua (HelperCRM v5yRgRCh).
   ========================================================================= */
window.MR_BARBER = {
  siteUrl: 'https://mrbarber-dnipro.vercel.app',

  brand: {
    name: 'Mr. BARBER',
    legalName: 'Mr. BARBER',
    tagline: 'Перша чоловіча перукарня у Дніпрі, створена перукарем',
    foundedNote: 'Перший барбершоп Дніпра',
    phoneDisplay: '+38 (097) 162 39 13',
    phoneHref: 'tel:+380971623913',
    address: 'м. Дніпро, вул. Воскресенська, 20',
    addressShort: 'вул. Воскресенська, 20',
    city: 'Дніпро',
    hours: 'Щодня з 10:00 до 20:00',
    hoursShort: '10:00–20:00',
    instagram: 'https://instagram.com/mr.barberdp',
    instagramHandle: '@mr.barberdp',
    facebook: 'https://facebook.com/mr.barberdp',
    googleRating: 4.8,
    googleReviews: 252,
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Mr.+BARBER+%D0%B2%D1%83%D0%BB.+%D0%92%D0%BE%D1%81%D0%BA%D1%80%D0%B5%D1%81%D0%B5%D0%BD%D1%81%D1%8C%D0%BA%D0%B0+20+%D0%94%D0%BD%D1%96%D0%BF%D1%80%D0%BE',
    googleRouteUrl:
      'https://www.google.com/maps/dir/?api=1&destination=48.4655279,35.039733',
    mapEmbedUrl:
      'https://www.google.com/maps?q=48.4655279,35.039733&hl=uk&z=17&output=embed',
    geo: { lat: 48.4655279, lng: 35.039733 },
    // Офіційний модуль запису, який зараз стоїть на mrbarber.com.ua
    crmWidgetUrl: 'https://crm.helpercrm.com/widgetJS?id=v5yRgRCh&current-lang=uk-UA',
    crmWidgetScript: 'https://crm.helpercrm.com/widget/script.js',
    crmWidgetId: 'v5yRgRCh',
  },

  /* ---------------------------------------------------------------------
     ПОСЛУГИ. Щоб змінити ціну — змініть price (грн) та duration (хв).
     cat: hair | beard | combo | care
     --------------------------------------------------------------------- */
  serviceCategories: [
    { id: 'hair', label: 'Стрижки', icon: 'scissors', note: 'Форма, що тримається щодня' },
    { id: 'beard', label: 'Борода та королівське гоління', icon: 'razor', note: 'Ритуал із гарячим рушником' },
    { id: 'combo', label: 'Комбо-сети', icon: 'spark', note: 'Вигідніше', badge: 'Вигідніше' },
    { id: 'care', label: 'Догляд та камуфляж', icon: 'drop', note: 'Делікатні деталі образу' },
  ],

  services: [
    {
      id: 'haircut',
      cat: 'hair',
      name: 'Чоловіча стрижка',
      desc: 'Консультація, мийка голови, стрижка під структуру волосся та укладка.',
      price: 600,
      duration: 60,
      badge: 'Хіт',
      popular: true,
    },
    {
      id: 'kids',
      cat: 'hair',
      name: 'Дитяча стрижка',
      desc: 'Для гостей до 12 років: спокійний темп, увага до малого гостя, без поспіху.',
      price: 450,
      duration: 45,
    },
    {
      id: 'fade',
      cat: 'hair',
      name: 'Стрижка машинкою · фейд',
      desc: 'Чистий градієнт, окремі лінії та акуратний контур.',
      price: 500,
      duration: 45,
    },
    {
      id: 'beard',
      cat: 'beard',
      name: 'Стрижка бороди та вусів',
      desc: 'Форма за лінією обличчя, корекція контуру, догляд олією.',
      price: 400,
      duration: 45,
    },
    {
      id: 'royal',
      cat: 'beard',
      name: 'Королівське гоління',
      desc: 'Гарячий рушник, небезпечна бритва, заспокійливий догляд після.',
      price: 500,
      duration: 45,
      badge: 'Ритуал',
      popular: true,
    },
    {
      id: 'headshave',
      cat: 'beard',
      name: 'Гоління голови',
      desc: 'Ідеально гладка шкіра, обрамлення та догляд без подразнення.',
      price: 350,
      duration: 30,
    },
    {
      id: 'beardcare',
      cat: 'beard',
      name: 'Догляд за бородою',
      desc: 'Олія, бальзам і легкий масаж — для м’якості та слухняності.',
      price: 250,
      duration: 20,
    },
    {
      id: 'combo-classic',
      cat: 'combo',
      name: 'Комбо «Стрижка + Борода»',
      desc: 'Повний образ за один візит: волосся, борода, укладка.',
      price: 900,
      duration: 90,
      badge: '−100 ₴',
      popular: true,
    },
    {
      id: 'combo-shave',
      cat: 'combo',
      name: 'Комбо «Стрижка + Королівське гоління»',
      desc: 'Стрижка та повний ритуал гоління з гарячим рушником.',
      price: 1000,
      duration: 105,
      badge: '−100 ₴',
    },
    {
      id: 'combo-father',
      cat: 'combo',
      name: 'Комбо «Батько + син»',
      desc: 'Дві стрижки поспіль — зручно для візиту з сином.',
      price: 950,
      duration: 90,
      badge: '−100 ₴',
    },
    {
      id: 'gray',
      cat: 'care',
      name: 'Камуфляж сивини',
      desc: 'Делікатне тонування без ефекту фарби, природний відтінок.',
      price: 500,
      duration: 40,
    },
    {
      id: 'graybeard',
      cat: 'care',
      name: 'Камуфляж бороди',
      desc: 'Виразна борода без сивих акцентів, м’який перехід тону.',
      price: 400,
      duration: 30,
    },
    {
      id: 'wax',
      cat: 'care',
      name: 'Депіляція воском',
      desc: 'Вуха та ніс — швидко, чисто й делікатно.',
      price: 150,
      duration: 15,
    },
    {
      id: 'mask',
      cat: 'care',
      name: 'Масаж голови та маска',
      desc: 'Розслаблюючий ритуал для шкіри голови після стрижки.',
      price: 300,
      duration: 25,
    },
  ],

  masters: [
    {
      id: 'yegor',
      name: 'Єгор',
      role: 'Барбер',
      initials: 'Є',
      photo: 'assets/img/master-yegor.jpg',
      photoWebp: 'assets/img/master-yegor.webp',
      photoAlt: 'Єгор — барбер Mr. BARBER',
      tags: ['Класична стрижка', 'Борода', 'Укладка'],
      note: 'Майстер, якого найчастіше згадують у відгуках гостей.',
    },
    {
      id: 'oleg',
      name: 'Олег',
      role: 'Барбер',
      initials: 'О',
      photo: 'assets/img/master-oleg.jpg',
      photoWebp: 'assets/img/master-oleg.webp',
      photoAlt: 'Олег — барбер Mr. BARBER',
      tags: ['Фейд', 'Королівське гоління', 'Борода'],
      note: 'Точні лінії, чистий перехід і увага до деталей.',
    },
    {
      id: 'senior',
      name: 'Старший барбер',
      role: 'Засновник · школа класичної стрижки',
      initials: 'MB',
      photo: 'assets/img/master-senior.jpg',
      photoWebp: 'assets/img/master-senior.webp',
      photoAlt: 'Старший барбер Mr. BARBER за роботою',
      tags: ['Класика', 'Складні форми', 'Навчання'],
      note: 'Створює школу класичної стрижки Mr. BARBER і тримає стандарт сервісу.',
    },
    {
      id: 'any',
      name: 'Будь-який вільний майстер',
      role: 'Найближчий вільний слот',
      initials: '★',
      tags: ['Швидкий запис', 'Будь-який майстер'],
      note: 'Підберемо майстра, який буде вільний у обраний вами час.',
      any: true,
    },
  ],

  booking: {
    slots: ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'],
    daysAhead: 7,
    storageKey: 'mrbarber.bookings.v1',
    profileKey: 'mrbarber.profile.v1',
  },

  /* Квіз: 3 кроки → персональна рекомендація */
  quiz: {
    steps: [
      {
        id: 'length',
        title: 'Яка довжина волосся зараз?',
        subtitle: 'Оберіть варіант, що найближчий до реальності.',
        options: [
          { value: 'short', label: 'Коротке', hint: 'до 3 см, машинка або ножиці' },
          { value: 'medium', label: 'Середнє', hint: 'чубчик, текстура, форма' },
          { value: 'long', label: 'Довге або кучері', hint: 'потрібна форма й вага' },
        ],
      },
      {
        id: 'lifestyle',
        title: 'Який у вас стиль життя?',
        subtitle: 'Від цього залежить, скільки часу ви готові приділяти укладці.',
        options: [
          { value: 'business', label: 'Бізнес та офіс', hint: 'стримано, акуратно, без зайвого' },
          { value: 'creative', label: 'Творчий', hint: 'текстура, характер, деталі' },
          { value: 'active', label: 'Спорт та активність', hint: 'мінімум догляду, максимум форми' },
          { value: 'father', label: 'Тато з сином', hint: 'хочу прийти разом із дитиною' },
        ],
      },
      {
        id: 'accent',
        title: 'Який акцент хочете зробити?',
        subtitle: 'Останній крок — і ми зберемо персональну рекомендацію.',
        options: [
          { value: 'classic', label: 'Чиста класика', hint: 'перевірена форма' },
          { value: 'fade', label: 'Сучасний фейд', hint: 'градієнт і чіткі лінії' },
          { value: 'beard', label: 'Борода', hint: 'повний образ' },
          { value: 'shave', label: 'Королівське гоління', hint: 'ритуал із бритвою' },
        ],
      },
    ],
    // Правила рекомендацій: перше правило, яке збігається, стає результатом.
    rules: [
      {
        when: { lifestyle: 'father' },
        services: ['combo-father'],
        master: 'any',
        title: 'Комбо «Батько + син»',
        text: 'Дві стрижки поспіль в одному візиті: доросла форма та акуратна дитяча стрижка. Зручно, коли ви прийшли з сином.',
      },
      {
        when: { accent: 'shave' },
        services: ['royal'],
        master: 'oleg',
        title: 'Королівське гоління · Олег',
        text: 'Гарячий рушник, небезпечна бритва та догляд після — повний чоловічий ритуал. Олег особливо уважний до чистого контуру.',
      },
      {
        when: { accent: 'beard' },
        services: ['combo-classic'],
        master: 'yegor',
        title: 'Комбо «Стрижка + Борода» · Єгор',
        text: 'Єгор збере повний образ: форма волосся, лінія бороди та укладка. Один візит — і виглядаєте зібрано щодня.',
      },
      {
        when: { accent: 'fade', lifestyle: 'active' },
        services: ['fade'],
        master: 'oleg',
        title: 'Фейд без щоденного догляду · Олег',
        text: 'Чистий градієнт тримає форму навіть у активному ритмі. Мінімум укладки — максимум акуратності.',
      },
      {
        when: { accent: 'fade' },
        services: ['fade'],
        master: 'oleg',
        title: 'Сучасний фейд · Олег',
        text: 'Олег зробить чистий перехід і чіткі лінії, які легко підтримувати між візитами.',
      },
      {
        when: { length: 'long' },
        services: ['haircut', 'mask'],
        master: 'senior',
        title: 'Форма для довгого волосся · Старший барбер',
        text: 'Школа класичної стрижки Mr. BARBER: знімемо зайву вагу, підкреслимо текстуру та додамо ритуал догляду за шкірою голови.',
      },
      {
        when: { lifestyle: 'business' },
        services: ['haircut'],
        master: 'yegor',
        title: 'Класична чоловіча стрижка · Єгор',
        text: 'Стримана форма, яка виглядає доречно в офісі та поза ним. Єгор прибирає зайве й залишає характер.',
      },
      {
        when: {},
        services: ['haircut'],
        master: 'any',
        title: 'Чоловіча стрижка · вільний майстер',
        text: 'Універсальна форма під структуру вашого волосся, з мийкою та укладкою. Підберемо майстра на зручний час.',
      },
    ],
  },

  reviewThemes: [
    {
      title: 'Про майстра Єгора',
      text: 'Гості відзначають уважність Єгора до форми та його вміння зробити стрижку, яка тримається між візитами.',
      icon: 'scissors',
    },
    {
      title: 'Умивальник біля крісла',
      text: 'Окремий умивальник біля кожного крісла — одна з найчастіших деталей, яку згадують у відгуках.',
      icon: 'drop',
    },
    {
      title: 'Атмосфера та сервіс',
      text: 'Кава або прохолодний напій, спокійна атмосфера й увага до деталей — те, за чим гості повертаються.',
      icon: 'spark',
    },
  ],
};
