const projects = {
  learny: {
    name: 'Learny', title: 'Learny',
    image: './assets/site-learny.webp', alt: 'Интерфейс Learny — языковая практика с AI-собеседником',
    summary: 'Языковая практика с AI-собеседником: голосовые разговоры, письменные упражнения и память о прошлых занятиях. Проект получил Best Agent на Agentplace Hackathon.',
    features: ['Голосовая и письменная практика языка.', 'Память о прошлых занятиях.', 'Интерфейс на русском, английском, испанском и немецком.'],
    stack: 'React / TypeScript / Voice AI / Agentplace',
    links: [{ label: 'Открыть сайт', url: 'https://mdza6hp6kqzf.run.agentplace.io/' }, { label: 'Код на GitHub', url: 'https://github.com/TakeMyEnerGy13/.Learny' }]
  },
  whiterock: {
    name: 'WhiteRock', title: 'WhiteRock',
    image: './assets/site-whiterock.webp', alt: 'Лендинг WhiteRock для привлечения пациентов в стоматологии',
    summary: 'Лендинг WhiteRock для стоматологических клиник. Предложение, выбор объёма заявок, кейсы агентства и форма обращения собраны в один понятный путь.',
    features: ['Предложение и варианты объёма заявок.', 'Кейсы, команда и этапы работы агентства.', 'Формы обращения и адаптивная вёрстка.'],
    stack: 'HTML / CSS / JavaScript',
    links: [{ label: 'Открыть сайт', url: 'https://clinic.whiterock.marketing/' }]
  },
  portfolio: {
    name: 'AI Engineer', title: 'AI Engineer',
    image: './assets/site-portfolio.png', alt: 'Портфолио TakeMyEnerGy: Make AI actually work, планета и объёмные логотипы AI-инструментов',
    summary: 'Моё портфолио AI Engineer. Минималистичная типографика, интерактивная планета и объёмные сцены объединяют проекты, опыт и контакты.',
    features: ['Интерактивная Земля и объёмные логотипы AI-инструментов.', 'Авторские WebGL-сцены и анимации интерфейса.', 'Русская и английская версии, адаптивная вёрстка.'],
    stack: 'HTML / CSS / JavaScript / WebGL / GSAP',
    links: [{ label: 'Открыть сайт', url: 'https://takemyenergy13.github.io/' }, { label: 'Код на GitHub', url: 'https://github.com/TakeMyEnerGy13/TakeMyEnerGy13.github.io' }]
  },
  hrum: {
    name: 'ХРУМ', title: 'ХРУМ',
    image: './assets/site-hrum.webp', alt: 'Сайт ХРУМ: оранжевый персонаж и заголовок «Заведи привычку»',
    summary: 'Лендинг концепта трекера привычек. Персонаж реагирует на курсор и клики, а форма заявки связывает сайт с Telegram-ботом и email-уведомлениями.',
    features: ['Интерактивный персонаж с реакцией на курсор и клики.', 'Форма заявки с интеграцией Telegram-бота.', 'Email-уведомления о заявках.'],
    stack: 'TypeScript / Fastify / Telegram',
    links: [{ label: 'Открыть сайт', url: 'https://hrum-landing.taile9bb5d.ts.net/' }, { label: 'Код на GitHub', url: 'https://github.com/TakeMyEnerGy13/hrum-landing' }]
  },
  travel: {
    name: 'Проотдых', title: 'Проотдых',
    image: './assets/site-prootdyh.webp', alt: 'Сайт Проотдых: фиолетовый первый экран с предложением подобрать тур',
    summary: 'Редизайн сайта туристического агентства: крупная типографика, акцент на подборе тура и адаптивная вёрстка. Отдельный визуальный стиль для путешествий.',
    features: ['Подбор тура как главный сценарий сайта.', 'Крупная типографика и визуальный стиль для путешествий.', 'Адаптивная вёрстка для разных экранов.'],
    stack: 'HTML / CSS / Responsive',
    links: [{ label: 'Открыть сайт', url: 'https://takemyenergy13.github.io/prootdyh-redesign/glavnaya.html' }, { label: 'Код на GitHub', url: 'https://github.com/TakeMyEnerGy13/prootdyh-redesign' }]
  }
};

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const motionButton = document.querySelector('.motion-toggle');
let userPaused = false;
try { userPaused = localStorage.getItem('storybook-motion-paused') === 'true'; } catch {}
let motionPaused = false;

function setMotionState() {
  motionPaused = userPaused || reduceMotion.matches;
  root.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.disabled = reduceMotion.matches;
  motionButton.querySelector('.motion-symbol').textContent = motionPaused ? '▷' : 'Ⅱ';
  const label = reduceMotion.matches ? 'Движение отключено системой' : motionPaused ? 'Включить движение' : 'Остановить движение';
  motionButton.querySelector('.motion-label').textContent = label;
  motionButton.setAttribute('aria-label', label);
  if (motionPaused) {
    document.querySelector('.forest-stage').style.cssText = '';
  }
}
motionButton.addEventListener('click', () => {
  userPaused = !userPaused;
  try { localStorage.setItem('storybook-motion-paused', String(userPaused)); } catch {}
  setMotionState();
});
reduceMotion.addEventListener('change', setMotionState);
setMotionState();

const environments = [...document.querySelectorAll('.environment')];
const visibleEnvironments = new Set();
function syncEnvironmentState() {
  const canMove = !motionPaused && !document.hidden && !root.classList.contains('intro-active') && !root.classList.contains('intro-pending');
  environments.forEach(environment => environment.classList.toggle('is-moving', canMove && visibleEnvironments.has(environment)));
}
const environmentObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visibleEnvironments.add(entry.target);
    else visibleEnvironments.delete(entry.target);
  });
  syncEnvironmentState();
});
environments.forEach(environment => environmentObserver.observe(environment));
new MutationObserver(syncEnvironmentState).observe(root, { attributes: true, attributeFilter: ['class'] });
document.addEventListener('visibilitychange', syncEnvironmentState);

const projectDialog = document.querySelector('#project-dialog');
function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
[projectDialog].forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  let backdropStart = false;
  dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog && isOutsideDialog(event, dialog); });
  dialog.addEventListener('click', event => {
    if (backdropStart && event.target === dialog && isOutsideDialog(event, dialog)) dialog.close();
    backdropStart = false;
  });
});
function isOutsideDialog(event, dialog) {
  const bounds = dialog.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
}
document.querySelectorAll('[data-open-project]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.openProject;
  const project = projects[key];
  document.querySelector('#case-title').textContent = project.name;
  document.querySelector('#case-intro').textContent = project.summary;
  document.querySelector('#case-stack').textContent = project.stack;
  const image = document.querySelector('#case-image');
  image.src = project.image;
  image.alt = project.alt;
  projectDialog.dataset.website = key;
  const features = document.querySelector('#case-features');
  features.replaceChildren(...project.features.map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  document.querySelector('#case-links').replaceChildren(...project.links.map(({ label, url }) => {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = label;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }));
  openDialog(projectDialog);
  projectDialog.scrollTop = 0;
}));

const hero = document.querySelector('.prologue');
const forest = document.querySelector('.forest-stage');
let pointerFrame = 0;
hero.addEventListener('pointermove', event => {
  if (motionPaused || !finePointer.matches) return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    if (motionPaused) return;
    const bounds = hero.getBoundingClientRect();
    forest.style.setProperty('--scene-x', `${(event.clientX / bounds.width - .5) * -12}px`);
    forest.style.setProperty('--scene-y', `${((event.clientY - bounds.top) / bounds.height - .5) * -8}px`);
  });
});
hero.addEventListener('pointerleave', () => {
  cancelAnimationFrame(pointerFrame);
  forest.style.setProperty('--scene-x', '0px');
  forest.style.setProperty('--scene-y', '0px');
});



