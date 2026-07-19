export type Project = {
  id: string;
  title: { en: string; ru: string };
  kind: { en: string; ru: string };
  summary: { en: string; ru: string };
  stack: string[];
  github: string;
  link?: string;
  year: string;
};

export const PROFILE = {
  name: 'TakeMyEnerGy',
  role: { en: 'AI Engineer', ru: 'AI-инженер' },
  hero: {
    en: 'Building the systems that make machines think clearly.',
    ru: 'Создаю системы, в которых машины думают ясно.',
  },
  blurb: {
    en: "I'm 24. Burning for neural networks: I build bots, pipelines and image generators — and design their interfaces myself. I believe the best way to understand a technology is to go and get your hands on it. In the endless process of discovering myself and the world.",
    ru: 'Мне 24. «Горю» нейросетями: собираю ботов, пайплайны и генераторы картинок — и сам рисую им интерфейсы. Верю, что лучший способ понять технологию — пойти и «пощупать» её на практике. В процессе бесконечного познания себя и мира.',
  },
  location: { en: 'Remote · UTC+3', ru: 'Удалённо · UTC+3' },
  github: 'https://github.com/TakeMyEnerGy13',
  email: 'takemyenergy1337@gmail.com',
  telegram: 'https://t.me/TakeMyEnerGy13',
} as const;

export const PROJECTS: Project[] = [
  {
    id: 'hh-agent',
    title: { en: 'HeadHunter Agent', ru: 'HeadHunter Agent' },
    kind: { en: 'Telegram Bot ‣ LLM Automation', ru: 'Telegram-бот ‣ LLM-автоматизация' },
    summary: {
      en: 'Telegram bot that searches HH.ru vacancies on a schedule, scores relevance against your CV with an LLM, and generates a personalised cover letter — so you only see jobs worth applying to.',
      ru: 'Telegram-бот: ищет вакансии на HH по расписанию, оценивает релевантность резюме через LLM и генерирует персонализированное сопроводительное письмо — приходят только те вакансии, на которые стоит откликнуться.',
    },
    stack: ['Python', 'aiogram', 'HH API', 'LLM', 'Telegram'],
    github: 'https://github.com/TakeMyEnerGy13/HeadHunter-agent',
    year: '2025',
  },
  {
    id: 'yandex-music-bot',
    title: { en: 'Yandex Music Bot', ru: 'Бот Яндекс.Музыки' },
    kind: { en: 'Telegram Bot ‣ Music API', ru: 'Telegram-бот ‣ Music API' },
    summary: {
      en: 'Send a Yandex Music link — get back a rich card with cover art, metadata, similar tracks, and cross-platform links to Spotify, Apple Music, YouTube Music and more. Inline mode, Redis cache, deployed on VPS.',
      ru: 'Отправь ссылку на Яндекс.Музыку — получи карточку с обложкой, метаданными, похожими треками и ссылками на Spotify, Apple Music, YouTube Music и другие. Inline-режим, Redis-кэш, деплой на VPS.',
    },
    stack: ['Python', 'aiogram', 'Yandex Music API', 'Redis', 'Docker'],
    github: 'https://github.com/TakeMyEnerGy13/yandex-music-bot',
    link: 'https://t.me/Yandex_botik_bot',
    year: '2025',
  },
  {
    id: 'task-manager-llm',
    title: { en: 'Task Manager LLM', ru: 'Task Manager LLM' },
    kind: { en: 'Web App ‣ LLM Assistant', ru: 'Веб-приложение ‣ LLM-ассистент' },
    summary: {
      en: 'Full-stack task manager with a Claude-powered assistant: auto-categorisation, priority suggestions, one-click task decomposition, and a natural-language workload summary.',
      ru: 'Полностековый таск-менеджер с ассистентом на Claude: авто-категоризация, предложение приоритета, декомпозиция задач одним кликом и сводка нагрузки на естественном языке.',
    },
    stack: ['Python', 'FastAPI', 'React', 'TypeScript', 'Claude API', 'SQLite'],
    github: 'https://github.com/TakeMyEnerGy13/task-manager-llm',
    year: '2025',
  },
];
