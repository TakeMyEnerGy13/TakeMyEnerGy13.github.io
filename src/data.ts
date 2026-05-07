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
    en: 'Independent AI engineer focused on production-grade LLM pipelines, retrieval, evaluation, and the messy glue around them.',
    ru: 'Независимый AI-инженер. Production-уровень LLM-пайплайнов, retrieval, evaluation и весь несентиментальный клей вокруг.',
  },
  location: { en: 'Remote · UTC+3', ru: 'Удалённо · UTC+3' },
  github: 'https://github.com/TakeMyEnerGy13',
  email: 'takemyenergy1337@gmail.com',
  telegram: 'https://t.me/TakeMyEnerGy13',
} as const;

export const PROJECTS: Project[] = [
  {
    id: 'rag-eval',
    title: { en: 'Recursive RAG Evaluator', ru: 'Рекурсивный RAG-эвалюатор' },
    kind: { en: 'LLM ‣ Evaluation Framework', ru: 'LLM ‣ Фреймворк оценки' },
    summary: {
      en: 'Multi-stage retrieval evaluation with synthetic adversaries and grounded answer scoring.',
      ru: 'Многоступенчатая оценка retrieval с синтетическими атаками и проверкой обоснованности ответов.',
    },
    stack: ['Python', 'PyTorch', 'LangGraph', 'Postgres + pgvector'],
    github: 'https://github.com/TakeMyEnerGy13',
    year: '2025',
  },
  {
    id: 'agent-runtime',
    title: { en: 'Agent Runtime', ru: 'Среда выполнения агентов' },
    kind: { en: 'Infra ‣ Tool-Using Agents', ru: 'Инфра ‣ Агенты с инструментами' },
    summary: {
      en: 'Minimal, deterministic runtime for tool-using agents with replayable traces and budget guards.',
      ru: 'Минимальная детерминированная среда для агентов с инструментами: воспроизводимые трейсы и контроль бюджетов.',
    },
    stack: ['TypeScript', 'OpenAI', 'Redis', 'OpenTelemetry'],
    github: 'https://github.com/TakeMyEnerGy13',
    year: '2025',
  },
  {
    id: 'embed-pipeline',
    title: {
      en: 'Streaming Embedding Pipeline',
      ru: 'Потоковый embedding-пайплайн',
    },
    kind: {
      en: 'Data ‣ Real-time Embeddings',
      ru: 'Данные ‣ Эмбеддинги в реальном времени',
    },
    summary: {
      en: 'High-throughput document ingestion with backpressure-aware embedding and incremental indexing.',
      ru: 'Высокопроизводительный приём документов с backpressure-aware эмбеддингом и инкрементальным индексом.',
    },
    stack: ['Python', 'Kafka', 'Qdrant', 'Ray'],
    github: 'https://github.com/TakeMyEnerGy13',
    year: '2024',
  },
  {
    id: 'finetune-lab',
    title: { en: 'Fine-Tune Lab', ru: 'Лаборатория дообучения' },
    kind: { en: 'Research ‣ LoRA / QLoRA', ru: 'Ресерч ‣ LoRA / QLoRA' },
    summary: {
      en: 'Reproducible fine-tuning recipes for small open models with eval-driven hyperparameter sweeps.',
      ru: 'Воспроизводимые рецепты дообучения малых open-моделей со sweep-ами под evaluation.',
    },
    stack: ['Python', 'PyTorch', 'Transformers', 'Weights & Biases'],
    github: 'https://github.com/TakeMyEnerGy13',
    year: '2024',
  },
];
