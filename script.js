import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== ДАННЫЕ =====
const PATHS = {
  sounds: {
    khomus: 'sounds/khomus.mp3',
    kyrympa: 'sounds/kyrympa.mp3',
    dungur: 'sounds/dungur.mp3'
  },
  models: {
    khomus: 'models/khomus.glb',
    kyrympa: 'models/kyrympa.glb',
    dungur: 'models/dungur.glb'
  },
  textures: {
    khomus: 'textures/khomus.png',
    kyrympa: 'textures/kyrympa.png',
    dungur: 'textures/dungur.png'
  },
  images: {
    khomus: 'images/khomus.png',
    khomus_hero: 'images/khomus_hero.jpg',
    khomus_card: 'images/khomus_card.jpg',
    kyrympa: 'images/kyrympa.png',
    kyrympa_hero: 'images/kyrympa_hero.jpeg',
    kyrympa_card: 'images/kyrympa_card.png',
    dungur: 'images/dungur.png',
    dungur_hero: 'images/dungur_hero.jpg',
    dungur_card: 'images/dungur_card.jpg'
  }
};

const instruments = [
  {
    id: 'khomus',
    name: 'Хомус',
    category: 'strings',
    description: 'Якутский варган — древний язычковый инструмент. Изготовляется из металла или дерева. Звук извлекается колебанием язычка, создавая богатый обертонами ритмический рисунок.',
    keywords: ['варган', 'хомус', 'язычковый', 'металлический', 'шаманский', 'khomus'],
    audio: PATHS.sounds.khomus,
    modelPath: PATHS.models.khomus,
    // Основная текстура (albedo/diffuse)
    texturePath: PATHS.textures.khomus,
    // Дополнительная карта цвета (color map)
    colorMapPath: 'textures/khomus_color.jpeg',
    // Первая bump-карта (bump map)
    bumpMap1Path: 'textures/khomus_bump2.png',
    // Вторая bump-карта (используется как normal map)
    bumpMap2Path: 'textures/khomus_bump1.png',
    color: 0x8b5a2b,
    imagePath: PATHS.images.khomus,
    heroImage: PATHS.images.khomus_hero,
    cardImage: PATHS.images.khomus_card,
  },
  {
    id: 'kyrympa',
    name: 'Кырыымпа',
    category: 'strings',
    description: 'Смычковый инструмент с овальным корпусом, напоминает скрипку. Имеет две струны, настраиваемые в квинту. Звук мягкий, певучий.',
    keywords: ['смычковый', 'скрипка', 'струнный', 'кырыымпа', 'тойук', 'kyrympa'],
    audio: PATHS.sounds.kyrympa,
    modelPath: PATHS.models.kyrympa,
    texturePath: PATHS.textures.kyrympa,
    colorMapPath: 'textures/kyrympa_color.png',
    bumpMap1Path: 'textures/kyrympa_bump1.png',
    bumpMap2Path: 'textures/kyrympa_bump2.png',
    color: 0x8b5a2b,
    imagePath: PATHS.images.kyrympa,
    heroImage: PATHS.images.kyrympa_hero,
    cardImage: PATHS.images.kyrympa_card,
  },
  {
    id: 'dungur',
    name: 'Дюнгюр',
    category: 'percussion',
    description: 'Шаманский бубен с широким ободом и натянутой кожей. Используется в ритуалах. Глубокий резонирующий звук достигается ударами колотушки.',
    keywords: ['бубен', 'шаманский', 'дюнгюр', 'ударный', 'ритуальный', 'dungur'],
    audio: PATHS.sounds.dungur,
    modelPath: PATHS.models.dungur,
    texturePath: PATHS.textures.dungur,
    colorMapPath: 'textures/dungur_color.jpeg',
    bumpMap1Path: 'textures/dungur_bump1.jpg',
    bumpMap2Path: 'textures/dungur_bump1.jpg',
    color: 0x4a3728,
    imagePath: PATHS.images.dungur,
    heroImage: PATHS.images.dungur_hero,
    cardImage: PATHS.images.dungur_card,
  }
];

// ===== ГЛОБАЛКИ =====
let currentInstrument = instruments[0];
let scene, camera, renderer, controls, currentModel;
const canvasId = 'threeCanvas';
const globalAudio = document.getElementById('globalAudio');
let isPlaying = false;
let isFullscreen = false;
let activeSuggestionIndex = -1;

const mainContent = document.getElementById('mainContent');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchToggle = document.getElementById('searchToggle');
const searchBox = document.getElementById('searchBox');
const searchClose = document.getElementById('searchClose');
const logoArea = document.getElementById('logoArea');
const navLinks = document.querySelectorAll('.header-nav-link');
const suggestionsContainer = document.getElementById('searchSuggestions');

// ===== ОБНОВЛЕНИЕ СЧЁТЧИКОВ КАТЕГОРИЙ =====
function updateCategoryCounts() {
  const stringsCount = instruments.filter(i => i.category === 'strings').length;
  const windsCount = instruments.filter(i => i.category === 'winds').length;
  const percCount = instruments.filter(i => i.category === 'percussion').length;
  
  const stringsEl = document.getElementById('stringsCount');
  const windsEl = document.getElementById('windsCount');
  const percEl = document.getElementById('percussionCount');
  
  if (stringsEl) stringsEl.textContent = stringsCount;
  if (windsEl) windsEl.textContent = windsCount;
  if (percEl) percEl.textContent = percCount;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  updateCategoryCounts();
  renderHomePage();
  setupSearch();
  setupLogo();
  setupNavLinks();
  setupCategories();

  document.addEventListener('click', () => {
    if (globalAudio) {
      globalAudio.play().catch(() => {});
    }
  }, { once: true });
});

// ===== КАТЕГОРИИ =====
function setupCategories() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      renderCategoryPage(category);
    });
  });
}

// ===== ПОИСК =====
function setupSearch() {
  searchToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    searchBox.classList.toggle('open');
    if (searchBox.classList.contains('open')) {
      searchInput.focus();
    }
  });

  searchClose.addEventListener('click', () => {
    searchBox.classList.remove('open');
    suggestionsContainer.classList.remove('show');
    searchInput.value = '';
  });

  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.search-wrapper');
    if (!wrapper.contains(e.target)) {
      searchBox.classList.remove('open');
      suggestionsContainer.classList.remove('show');
    }
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    showSuggestions(query);
  });

  searchInput.addEventListener('focus', () => {
    if (searchBox.classList.contains('open')) {
      const query = searchInput.value.trim();
      showSuggestions(query || '');
    }
  });

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    suggestionsContainer.classList.remove('show');
    searchBox.classList.remove('open');
    if (query) {
      performSearch(query);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = suggestionsContainer.querySelectorAll('.suggestion-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
      updateActiveSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, -1);
      updateActiveSuggestion(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && items[activeSuggestionIndex]) {
        items[activeSuggestionIndex].click();
      } else {
        const query = searchInput.value.trim().toLowerCase();
        suggestionsContainer.classList.remove('show');
        searchBox.classList.remove('open');
        if (query) performSearch(query);
      }
    } else if (e.key === 'Escape') {
      suggestionsContainer.classList.remove('show');
      searchBox.classList.remove('open');
      activeSuggestionIndex = -1;
    }
  });
}

function showSuggestions(query) {
  if (!query) {
    suggestionsContainer.classList.remove('show');
    return;
  }

  activeSuggestionIndex = -1;
  const q = query.toLowerCase();
  const filtered = instruments.filter(inst => {
    const searchText = `${inst.name} ${inst.description} ${inst.keywords.join(' ')}`.toLowerCase();
    return searchText.includes(q);
  });

  if (filtered.length > 0) {
    renderSuggestions(filtered, q);
  } else {
    suggestionsContainer.innerHTML = '<div class="suggestion-no-results">🔍 Ничего не найдено</div>';
    suggestionsContainer.classList.add('show');
  }
}

function renderSuggestions(container, items, query) {
  let html = '';
  items.forEach((inst, index) => {
    const highlightedName = highlightText(inst.name, query);
    const shortDesc = inst.description.substring(0, 60) + '...';
    const highlightedDesc = highlightText(shortDesc, query);

    html += `
      <div class="suggestion-item" data-id="${inst.id}" data-index="${index}">
        <div class="suggestion-info">
          <span class="suggestion-name">${highlightedName}</span>
          <span class="suggestion-desc">${highlightedDesc}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  container.classList.add('show');

  container.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const inst = instruments.find(i => i.id === id);
      if (inst) {
        searchInput.value = inst.name;
        container.classList.remove('show');
        searchBox.classList.remove('open');
        renderInstrumentPage(inst);
      }
    });
  });
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateActiveSuggestion(items) {
  items.forEach((item, i) => {
    if (i === activeSuggestionIndex) {
      item.classList.add('active');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('active');
    }
  });
}

// ===== ЛОГОТИП =====
function setupLogo() {
  logoArea.addEventListener('click', () => {
    renderHomePage();
  });
}

// ===== НАВИГАЦИЯ =====
function setupNavLinks() {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      renderCategoryPage(category);
    });
  });
}

// ===== СТРАНИЦА КАТЕГОРИИ =====
function renderCategoryPage(category) {
  const filtered = instruments.filter(inst => inst.category === category);
  const categoryNames = {
    strings: 'Струнные инструменты',
    winds: 'Духовые инструменты',
    percussion: 'Ударные инструменты'
  };

  mainContent.innerHTML = `
    <div style="margin:16px 0 16px 16px;">
      <h1 style="font-family:'Akony',sans-serif; font-size:2.4rem; color:#1a1a1a;">${categoryNames[category]}</h1>
      <p style="color:#666; margin-top:4px;">Найдено: ${filtered.length} инструментов</p>
    </div>
    <div class="products-grid" id="categoryGrid"></div>
    <div style="margin:16px 0 0 16px;">
      <button class="back-home-btn" id="backFromCategory" style="display:inline-flex;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
        </svg>
        На главную
      </button>
    </div>
  `;

  document.getElementById('backFromCategory').addEventListener('click', renderHomePage);

  const grid = document.getElementById('categoryGrid');
  filtered.forEach(inst => {
    const card = createProductCard(inst);
    grid.appendChild(card);
  });
}

// ===== СОЗДАНИЕ КАРТОЧКИ =====
function createProductCard(inst) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img class="product-img" src="${inst.imagePath}" alt="${inst.name}" />
    <div class="product-title">${inst.name}</div>
    <div class="product-desc">${inst.description}</div>
    <button class="add-to-cart" data-id="${inst.id}">Подробнее</button>
  `;
  card.querySelector('.add-to-cart').addEventListener('click', (e) => {
    e.stopPropagation();
    renderInstrumentPage(inst);
  });
  card.addEventListener('click', () => renderInstrumentPage(inst));
  return card;
}

// ===== ГЛАВНАЯ =====
function renderHomePage() {
  isFullscreen = false;
  globalAudio.pause();
  globalAudio.src = '';
  isPlaying = false;

  // Путь к фото для главной страницы
  const heroImage = 'images/hero.png'; // Или любое другое фото

  mainContent.innerHTML = `
    <div class="hero-fullwidth">

      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>Звуки Саха</h1>
        <p>Познакомьтесь с культурой народа Саха через звук и 3D-образы</p>
      </div>
    </div>
    <div style="padding: 24px 20px 48px;">
      <div class="home-grid" id="homeGrid"></div>
    </div>
  `;
  mainContent.innerHTML = `
    <div class="hero-image">
      <img src="images/hero.png" alt="Звуки Саха" />
    </div>

    <div class="more-grid" id="moreGrid">
      <div class="more-card" data-section="catalog">
        <div class="more-card-left">
          <span class="more-card-desc">Все инструменты в одном месте</span>
        </div>
        <span class="more-card-title">Каталог</span>
      </div>
      <div class="more-card" data-section="history">
        <div class="more-card-left">
          <span class="more-card-desc">История и традиции народа Саха</span>
        </div>
        <span class="more-card-title">История</span>
      </div>
      <div class="more-card" data-section="project">
        <div class="more-card-left">
          <span class="more-card-desc">О проекте</span>
        </div>
        <span class="more-card-title">Проект</span>
      </div>
    </div>

    <h2 class="instruments-section-title">Инструменты</h2>
    <div class="products-grid" id="homeGrid"></div>
  `;

  document.querySelectorAll('.more-card').forEach(card => {
    card.addEventListener('click', () => {
      const section = card.dataset.section;
      if (section === 'catalog') {
        document.querySelector('.instruments-section-title').scrollIntoView({ behavior: 'smooth' });
      } else if (section === 'history') {
        renderHistoryPage();
      } else if (section === 'project') {
        renderProjectPage();
      }
    });
  });

  const grid = document.getElementById('homeGrid');
  instruments.forEach(inst => {
    const card = createProductCard(inst);
    grid.appendChild(card);
  });
}

// ===== СТРАНИЦА "ИСТОРИЯ" =====
function renderHistoryPage() {
  mainContent.innerHTML = `
    <div style="max-width:1000px; margin:0 auto; padding:0 4px;">
      <button class="back-home-btn" id="backFromHistory" style="display:inline-flex; margin:16px 0 16px 16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
        </svg>
        На главную
      </button>

      <h1 style="font-family:'Montserrat',sans-serif; font-size:2.8rem; color:#1a1a1a; margin:0 0 20px 16px;">
        История <span style="color:#c9a063;">народных инструментов Саха</span>
      </h1>

      <!-- ===== ВИДЕО С ДЗЕНА ===== -->
      <div style="margin: 0 4px 24px 4px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border: 2px solid #ccc; background: #000;">
        <iframe 
          src="https://dzen.ru/embed/vVuBKSTQI8h4?from_block=partner&from=zen&mute=0&autoplay=0&tv=0" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
          allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture; encrypted-media" 
          data-testid="embed-iframe" 
          frameborder="0" 
          scrolling="no" 
          allowfullscreen>
        </iframe>
      </div>

      <div style="background:#d5d1cb; border:2px solid #ccc; padding:28px 32px; margin:0 4px;">

        <h2 style="font-family:'Montserrat',sans-serif; font-size:1.6rem; color:#1a1a1a; margin-bottom:12px; border-bottom:2px solid #c9a063; padding-bottom:6px;">
           Истоки и духовное значение
        </h2>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:20px;">
          Музыкальная культура <strong>народа Саха (якутов)</strong> — одна из древнейших в Сибири. Её корни уходят в глубину веков, к <strong>шаманским ритуалам</strong> и <strong>эпическому наследию олонхо</strong>. Инструменты для якутов — не просто предметы для извлечения звука, а <strong>посредники между миром людей и духов</strong>. Каждый инструмент имел сакральное значение и использовался в определённых обрядах.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:24px;">
          Традиционно изготовлением инструментов занимались <strong>мастера-кузнецы</strong> (для металлических) и <strong>резчики по дереву</strong>. Знания передавались из поколения в поколение, и каждый мастер вносил что-то своё, сохраняя при этом каноническую форму и звучание.
        </p>

        <h2 style="font-family:'Montserrat',sans-serif; font-size:1.6rem; color:#1a1a1a; margin-bottom:12px; border-bottom:2px solid #c9a063; padding-bottom:6px;">
           Хомус — голос шамана
        </h2>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          <strong>Хомус</strong> — якутский варган, один из <strong>самых древних инструментов</strong> на планете. Его история насчитывает более <strong>5 тысяч лет</strong>. В Якутии хомус изготавливали из <strong>металла</strong> (кованое железо, латунь, серебро) или <strong>дерева</strong> (лиственница, сосна).
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          <strong>Шаманы</strong> использовали хомус для <strong>вхождения в транс</strong>. Считалось, что вибрации язычка создают «мостик» между мирами, позволяя общаться с духами предков и природными силами. Звук хомуса имитирует <strong>голос ветра, журчание воды и крики птиц</strong> — всё то, что окружало кочевника в степи.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:24px;">
          В якутской культуре хомус также был <strong>инструментом личного самовыражения</strong>. Мужчины и женщины играли на нём, передавая свои чувства, от радости до глубокой печали. Существовали даже <strong>«хомусные состязания»</strong>, где мастера соревновались в виртуозности и изобретательности.
        </p>

        <h2 style="font-family:'Montserrat',sans-serif; font-size:1.6rem; color:#1a1a1a; margin-bottom:12px; border-bottom:2px solid #c9a063; padding-bottom:6px;">
           Кырыымпа — певучая душа степи
        </h2>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          <strong>Кырыымпа</strong> — смычковый струнный инструмент, напоминающий скрипку, но имеющий <strong>уникальную конструкцию</strong>. Корпус делали из <strong>цельного куска дерева</strong> (кедра или лиственницы), а струны — из <strong>конского волоса</strong> или <strong>жил животных</strong>.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          Звук кырыымпы — <strong>мягкий, певучий</strong>, напоминающий <strong>человеческий голос</strong>. Именно поэтому инструмент часто <strong>аккомпанировал тойукам</strong> — народным песням-импровизациям, которые исполняли певцы-олонхосуты. Считалось, что кырыымпа «подпевает» рассказчику, усиливая эмоциональное воздействие эпоса.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:24px;">
          Инструмент символизировал <strong>связь человека с природой</strong>. Его звук сравнивали с <strong>журчанием реки или пением лебедя</strong>. В XX веке кырыымпа почти исчезла, но сегодня <strong>возрождается</strong> благодаря энтузиастам и мастерам, сохраняющим традиции предков.
        </p>

        <h2 style="font-family:'Montserrat',sans-serif; font-size:1.6rem; color:#1a1a1a; margin-bottom:12px; border-bottom:2px solid #c9a063; padding-bottom:6px;">
           Дюнгюр — ритм вселенной
        </h2>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          <strong>Дюнгюр</strong> — шаманский бубен, который называют <strong>«конём шамана»</strong>. Его обод изготавливали из <strong>лиственницы</strong>, а мембрану — из <strong>оленьей или лосиной кожи</strong>. По краям бубна крепили <strong>металлические подвески</strong>, которые создавали дополнительный звенящий фон.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          Во время камлания шаман бил в дюнгюр <strong>колотушкой</strong>, задавая ритм путешествию в <strong>верхний или нижний мир</strong>. Считалось, что <strong>глубокий резонирующий звук</strong> прогоняет злых духов и призывает добрых. Каждый удар символизировал шаг между мирами.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:24px;">
          Дюнгюр — не просто инструмент, а <strong>объект силы</strong>. Его изготавливали по строгим ритуалам, а перед использованием «оживляли» специальными обрядами. Считалось, что бубен «помнит» голос своего хозяина и отвечает ему.
        </p>

        <h2 style="font-family:'Montserrat',sans-serif; font-size:1.6rem; color:#1a1a1a; margin-bottom:12px; border-bottom:2px solid #c9a063; padding-bottom:6px;">
           Возрождение традиций сегодня
        </h2>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          В <strong>современной Якутии</strong> народные инструменты переживают <strong>новое рождение</strong>. Открываются мастерские, где восстанавливают древние технологии изготовления. Молодые музыканты интегрируют звучание хомуса, кырыымпы и дюнгюра в <strong>этно-фьюжн, джаз и даже электронную музыку</strong>.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333; margin-bottom:16px;">
          Ежегодно в Якутске проходит <strong>международный фестиваль варганной музыки</strong>, где собираются мастера со всего мира. А хомус стал <strong>символом культурного возрождения</strong> народа Саха.
        </p>
        <p style="font-size:1.05rem; line-height:1.9; color:#333;">
          Проект <strong>«Sounds of Sakha»</strong> — это наш скромный вклад в сохранение и популяризацию этой удивительной музыкальной традиции. Слушая звуки древних инструментов, мы прикасаемся к <strong>тысячелетней истории</strong> и <strong>душе народа Саха</strong>.
        </p>
      </div>
    </div>
  `;
  document.getElementById('backFromHistory').addEventListener('click', renderHomePage);
}

// ===== СТРАНИЦА "ПРОЕКТ" =====
function renderProjectPage() {
  mainContent.innerHTML = `
    <div style="max-width:900px; margin:16px auto 0;">
      <button class="back-home-btn" id="backFromProject" style="display:inline-flex; margin-bottom:16px; margin-left:16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
        </svg>
        На главную
      </button>
      <h1 style="font-family:'Akony',sans-serif; font-size:2.8rem; color:#1a1a1a; margin:0 0 16px 16px;">О <span style="color:#c9a063;">проекте</span></h1>
      <div style="background:#e8e0d8; border:2px solid #ccc; padding:32px; margin:0 4px;">
        <p style="font-size:1.1rem; line-height:1.8; color:#333; margin-bottom:16px;">
          <strong>«Sounds of Sakha»</strong> — это интерактивный гид по якутским музыкальным инструментам, созданный в рамках курсовой работы.
        </p>
        <p style="font-size:1.1rem; line-height:1.8; color:#333; margin-bottom:16px;">
          <strong>Цель проекта:</strong> познакомить людей с богатой музыкальной культурой народа Саха через современные технологии — 3D-моделирование и интерактивный звук.
        </p>
        <p style="font-size:1.1rem; line-height:1.8; color:#333; margin-bottom:16px;">
          <strong>Технологии:</strong> HTML, CSS, JavaScript, Three.js (3D-визуализация), Web Audio API.
        </p>
        <p style="font-size:1.1rem; line-height:1.8; color:#333;">
          <strong>Автор:</strong> Бандеров Богдан, студент группы ПИ-25.
        </p>
      </div>
    </div>
  `;
  document.getElementById('backFromProject').addEventListener('click', renderHomePage);
}

// ===== СТРАНИЦА ИНСТРУМЕНТА =====
function renderInstrumentPage(instrument) {
  currentInstrument = instrument;
  isFullscreen = false;

  globalAudio.pause();
  globalAudio.src = '';

  const heroImage = instrument.heroImage || instrument.imagePath;
  const cardImage = instrument.cardImage || instrument.imagePath;

  // Новое описание для страницы инструмента (можно задать отдельно)
  const instrumentDescriptions = {
    khomus: 'Хомус — это не просто инструмент, а голос предков. Его металлический язычок рождает вибрации, которые проникают в самую душу, открывая врата между мирами.',
    kyrympa: 'Кырыымпа — это песня степи, воплощённая в дереве и струнах. Её мягкий голос рассказывает истории о любви, свободе и бескрайних просторах Якутии.',
    dungur: 'Дюнгюр — это сердце шаманского ритуала. Его глубокий ритм пульсирует в такт вселенной, призывая духов и очищая пространство.'
  };

  const longDescription = instrumentDescriptions[instrument.id] || instrument.description;

  mainContent.innerHTML = `
    <!-- ===== БЛОК 1: 50% ФОТО + 50% 3D МОДЕЛЬ ===== -->
    <div class="instrument-feature">
      <div class="feature-split-50">
        <!-- Левая половина: фото -->
        <div class="feature-split-half feature-split-image">
          <img src="${heroImage}" alt="${instrument.name}" />
          <div class="split-overlay">
            <h2>${instrument.name}</h2>
            <p>${longDescription}</p>
          </div>
        </div>
        <!-- Правая половина: 3D модель -->
        <div class="feature-split-half feature-split-3d" id="modelContainer">
          <canvas id="${canvasId}"></canvas>
          <button class="fullscreen-btn" id="fullscreenBtn" title="На весь экран">
            <svg id="expandIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <svg id="collapseIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          </button>
          <div class="model-hint-3d">СКМ масштаб • ЛКМ переместить</div>
        </div>
      </div>
    </div>

    <!-- ===== БЛОК 2: ФОТО СЛЕВА + АУДИОПЛЕЕР СПРАВА ===== -->
    <div class="instrument-feature">
      <div class="feature-card audio-card">
        <div class="card-image">
          <img src="${cardImage}" alt="${instrument.name}" />
        </div>
        <div class="card-text audio-card-text">
          <span class="label">Прослушать звучание</span>
          <h2>${instrument.name}</h2>
          <!-- АУДИОПЛЕЕР -->
          <div class="audio-player-card">
            <div class="player-row">
              <button class="play-btn-audio" id="playPauseBtnAudio">
                <svg id="playIconAudio" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg id="pauseIconAudio" viewBox="0 0 24 24" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>
              <div class="player-info-audio">
                <div class="track-name">${instrument.name}</div>
                <div class="track-artist">Звук • Якутский народный инструмент</div>
                <div class="progress-bar-audio" id="progressBarAudio">
                  <div class="progress-fill-audio" id="progressFillAudio"></div>
                </div>
                <div class="time-display-audio">
                  <span id="currentTimeAudio">0:00</span> / <span id="durationAudio">0:00</span>
                </div>
              </div>
            </div>
          </div>
          <button class="back-home-btn" id="backHomeBtn" style="margin-top:20px;">← На главную</button>
        </div>
      </div>
    </div>

    <div class="fullscreen-overlay" id="fullscreenOverlay"></div>
  `;

  // Обработчики
  document.getElementById('backHomeBtn').addEventListener('click', () => {
    navigateTo('/');
  });

  setTimeout(() => {
    initThreeJS(instrument);
    setupAudioPlayer(instrument.audio);
    setupFullscreen();
  }, 200);
}

function initThreeJS(instrument) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  if (currentModel && scene) {
    scene.remove(currentModel);
    currentModel = null;
  }

  const container = canvas.parentElement;
  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcac7c2);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(2.5, 1.8, 4.5);

  renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    alpha: false // ОТКЛЮЧАЕМ ПРОЗРАЧНОСТЬ
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.sortObjects = true; // Правильная сортировка объектов

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  controls.minDistance = 2;
  controls.maxDistance = 8;

  // ===== УЛУЧШЕННОЕ ОСВЕЩЕНИЕ =====
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(2, 4, 3);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-2, 1, -3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
  rimLight.position.set(0, -1, 4);
  scene.add(rimLight);

  const backLight = new THREE.PointLight(0xc9a063, 0.6);
  backLight.position.set(-1, 0.5, -2);
  scene.add(backLight);

  // ===== ЗАГРУЗКА МОДЕЛИ С ТЕКСТУРАМИ =====
  const textureLoader = new THREE.TextureLoader();
  const loader = new GLTFLoader();

  // Пути к текстурам (4 текстуры)
  const texturePaths = {
    base: instrument.texturePath,
    color: instrument.colorMapPath || instrument.texturePath,
    bump1: instrument.bumpMap1Path || null,
    bump2: instrument.bumpMap2Path || null
  };

  // Загружаем все текстуры параллельно
  const textures = {};
  let loadedCount = 0;
  const totalTextures = 1 + (texturePaths.color ? 1 : 0) + 
                        (texturePaths.bump1 ? 1 : 0) + 
                        (texturePaths.bump2 ? 1 : 0);

  function checkAllLoaded() {
    loadedCount++;
    if (loadedCount >= totalTextures) {
      // Все текстуры загружены — загружаем модель
      loadModelWithAllTextures(instrument, textures);
    }
  }

  // Загрузка основной текстуры (base)
  textureLoader.load(
    texturePaths.base,
    (tex) => {
      textures.base = tex;
      checkAllLoaded();
    },
    undefined,
    () => {
      textures.base = null;
      checkAllLoaded();
    }
  );

  // Загрузка текстуры цвета (color)
  if (texturePaths.color && texturePaths.color !== texturePaths.base) {
    textureLoader.load(
      texturePaths.color,
      (tex) => {
        textures.color = tex;
        checkAllLoaded();
      },
      undefined,
      () => {
        textures.color = null;
        checkAllLoaded();
      }
    );
  } else {
    textures.color = textures.base;
    loadedCount++;
  }

  // Загрузка первой bump-карты
  if (texturePaths.bump1) {
    textureLoader.load(
      texturePaths.bump1,
      (tex) => {
        textures.bump1 = tex;
        checkAllLoaded();
      },
      undefined,
      () => {
        textures.bump1 = null;
        checkAllLoaded();
      }
    );
  } else {
    textures.bump1 = null;
    loadedCount++;
  }

  // Загрузка второй bump-карты
  if (texturePaths.bump2) {
    textureLoader.load(
      texturePaths.bump2,
      (tex) => {
        textures.bump2 = tex;
        checkAllLoaded();
      },
      undefined,
      () => {
        textures.bump2 = null;
        checkAllLoaded();
      }
    );
  } else {
    textures.bump2 = null;
    loadedCount++;
  }

  const resizeHandler = () => {
    if (!canvas || !camera || !renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', resizeHandler);

  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }
  animate();
}

// ===== ЗАГРУЗКА МОДЕЛИ С 4 ТЕКСТУРАМИ =====
function loadModelWithAllTextures(instrument, textures) {
  const loader = new GLTFLoader();

  loader.load(
    instrument.modelPath,
    (gltf) => {
      if (currentModel) scene.remove(currentModel);
      const model = gltf.scene;

      // Применяем текстуры ко всем мешам модели
      model.traverse((child) => {
        if (child.isMesh) {
          // Проверяем, есть ли у материала прозрачность
          const isTransparent = child.material && child.material.transparent === true;
          
          // Создаём материал с поддержкой нескольких текстур
          const materialProps = {
            roughness: 0.5,
            metalness: 0.3,
            color: new THREE.Color(instrument.color || 0x888888),
            // ОТКЛЮЧАЕМ ПРОЗРАЧНОСТЬ
            transparent: false,
            opacity: 1.0,
            // Настройки для правильного отображения
            side: THREE.DoubleSide, // Отрисовка с обеих сторон
            depthWrite: true,
            depthTest: true
          };

          // Основная текстура (diffuse/albedo)
          if (textures.base) {
            materialProps.map = textures.base;
          }

          // Первая bump-карта
          if (textures.bump1) {
            materialProps.bumpMap = textures.bump1;
            materialProps.bumpScale = 0.3;
          }

          // Вторая bump-карта — как normal map
          if (textures.bump2) {
            materialProps.normalMap = textures.bump2;
            materialProps.normalScale = new THREE.Vector2(0.8, 0.8);
          }

          // Создаём новый материал
          const newMaterial = new THREE.MeshStandardMaterial(materialProps);
          
          // Копируем UV-развёртку если нужно
          if (child.material && child.material.map) {
            // Сохраняем UV-развёртку
          }
          
          child.material = newMaterial;
          child.material.needsUpdate = true;
        }
      });

      // Масштабирование модели
      if (instrument.id === 'khomus') model.scale.set(1.2, 1.2, 1.2);
      else if (instrument.id === 'dungur') model.scale.set(1.1, 1.1, 1.1);

      scene.add(model);
      currentModel = model;
    },
    undefined,
    (error) => {
      console.warn('Модель не загружена, создаю процедурную:', error);
      createProceduralModel(instrument, textures.base);
    }
  );
}

// ===== ОБНОВЛЁННАЯ ПРОЦЕДУРНАЯ МОДЕЛЬ =====
function createProceduralModel(instrument, texture = null) {
  if (currentModel) scene.remove(currentModel);

  const group = new THREE.Group();
  const mat = texture
    ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: instrument.color, roughness: 0.5, metalness: 0.3 });

  if (instrument.id === 'khomus') {
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.12, 16, 32), mat);
    group.add(frame);
    const tongue = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.9, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xccaa55, roughness: 0.3, metalness: 0.7 })
    );
    tongue.position.set(0, -0.1, 0);
    group.add(tongue);
  } else if (instrument.id === 'kyrympa') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, 1.6, 32), mat);
    group.add(body);
    const neck = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.9, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.7 })
    );
    neck.position.set(0, 0.9, 0);
    group.add(neck);
  } else if (instrument.id === 'dungur') {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.15, 16, 40),
      new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.7 })
    );
    group.add(ring);
    const membrane = new THREE.Mesh(new THREE.CircleGeometry(0.73, 32), mat);
    group.add(membrane);
  }

  scene.add(group);
  currentModel = group;
}

// ===== АУДИО =====
function setupAudioPlayer(audioSrc) {
  // Элементы нового плеера (в блоке 2)
  const playBtnAudio = document.getElementById('playPauseBtnAudio');
  const progressFillAudio = document.getElementById('progressFillAudio');
  const progressBarAudio = document.getElementById('progressBarAudio');
  const currentTimeAudio = document.getElementById('currentTimeAudio');
  const durationAudio = document.getElementById('durationAudio');
  const playIconAudio = document.getElementById('playIconAudio');
  const pauseIconAudio = document.getElementById('pauseIconAudio');

  if (!playBtnAudio) return;

  globalAudio.src = audioSrc;
  globalAudio.load();
  isPlaying = false;
  updateAudioIcons(false);

  globalAudio.onloadedmetadata = () => {
    durationAudio.textContent = formatTime(globalAudio.duration);
  };

  globalAudio.ontimeupdate = () => {
    if (globalAudio.duration) {
      const percent = (globalAudio.currentTime / globalAudio.duration) * 100;
      progressFillAudio.style.width = percent + '%';
      currentTimeAudio.textContent = formatTime(globalAudio.currentTime);
    }
  };

  globalAudio.onended = () => {
    isPlaying = false;
    updateAudioIcons(false);
    progressFillAudio.style.width = '0%';
    currentTimeAudio.textContent = '0:00';
  };

  globalAudio.onerror = () => {
    console.error('Ошибка загрузки аудио:', audioSrc);
  };

  // Кнопка плеера
  playBtnAudio.onclick = () => {
    if (globalAudio.paused) {
      globalAudio.play()
        .then(() => {
          isPlaying = true;
          updateAudioIcons(true);
        })
        .catch(e => console.log('Ожидание взаимодействия:', e));
    } else {
      globalAudio.pause();
      isPlaying = false;
      updateAudioIcons(false);
    }
  };

  // Прогресс-бар
  progressBarAudio.onclick = (e) => {
    if (!globalAudio.duration) return;
    const rect = progressBarAudio.getBoundingClientRect();
    const x = e.clientX - rect.left;
    globalAudio.currentTime = (x / rect.width) * globalAudio.duration;
  };

  function updateAudioIcons(playing) {
    if (playIconAudio && pauseIconAudio) {
      playIconAudio.style.display = playing ? 'none' : 'block';
      pauseIconAudio.style.display = playing ? 'block' : 'none';
    }
  }
}
// ===== FULLSCREEN =====
function setupFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const modelContainer = document.getElementById('modelContainer');
  const overlay = document.getElementById('fullscreenOverlay');
  const expandIcon = document.getElementById('expandIcon');
  const collapseIcon = document.getElementById('collapseIcon');

  if (!fullscreenBtn) return;

  fullscreenBtn.addEventListener('click', () => {
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
      modelContainer.classList.add('fullscreen');
      overlay.classList.add('active');
      expandIcon.style.display = 'none';
      collapseIcon.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } else {
      modelContainer.classList.remove('fullscreen');
      overlay.classList.remove('active');
      expandIcon.style.display = 'block';
      collapseIcon.style.display = 'none';
      document.body.style.overflow = '';
    }

    setTimeout(() => {
      if (renderer && camera) {
        const container = document.getElementById(canvasId).parentElement;
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }, 100);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen) {
      fullscreenBtn.click();
    }
  });

  overlay.addEventListener('click', () => {
    if (isFullscreen) fullscreenBtn.click();
  });
}

// ===== ПОИСК =====
function performSearch(query) {
  if (!query) {
    renderHomePage();
    return;
  }

  const q = query.toLowerCase();
  const found = instruments.filter(inst => {
    const searchText = `${inst.name} ${inst.description} ${inst.keywords.join(' ')}`.toLowerCase();
    return searchText.includes(q);
  });

  if (found.length === 1) {
    renderInstrumentPage(found[0]);
  } else if (found.length > 1) {
    mainContent.innerHTML = `
      <div style="margin:16px 0 16px 16px;">
        <h2 style="font-family:'Akony',sans-serif;">Результаты поиска: "${query}"</h2>
        <p style="margin-top:8px; color:#555;">Найдено инструментов: ${found.length}</p>
      </div>
      <div class="products-grid" id="searchGrid"></div>
      <div style="margin:16px 0 0 16px;">
        <button class="back-home-btn" id="backFromSearch" style="display:inline-flex;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
          </svg>
          На главную
        </button>
      </div>
    `;
    document.getElementById('backFromSearch').addEventListener('click', renderHomePage);

    const grid = document.getElementById('searchGrid');
    found.forEach(inst => {
      const card = createProductCard(inst);
      grid.appendChild(card);
    });
  } else {
    mainContent.innerHTML = `
      <div style="text-align:center; margin-top:60px;">
        <div style="font-size:3rem; margin-bottom:16px;">🔍</div>
        <h2 style="font-family:'Akony',sans-serif;">Ничего не найдено</h2>
        <p style="margin-top:8px; color:#666;">По запросу "${query}" инструментов нет</p>
        <p style="margin-top:4px; color:#888;">Попробуйте: хомус, бубен, варган, смычковый</p>
        <button class="back-home-btn" id="backFromEmpty" style="display:inline-flex; margin-top:20px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
          </svg>
          На главную
        </button>
      </div>
    `;
    document.getElementById('backFromEmpty').addEventListener('click', renderHomePage);
  }
}