# Замена hero-картинки на премиум-нумерологию

## Проблема
На первом экране (`src/components/quiz/Quiz.tsx`, компонент `Hero`) сейчас используется `src/assets/quiz/hero-cosmic.jpg` — AI-изображение с чакрами и санскритом. Для платного трафика это выглядит дёшево, эзотерично и не отражает позиционирование «математической последовательности» из заголовка ("Your Life is Not Random. It's a Mathematical Sequence.").

## Что сделаю

1. **Сгенерирую новое premium-изображение** через `imagegen` (модель `premium` — лучшее качество для богатой типографики/цифр) с промптом в стиле:
   - Богатая композиция из светящихся золотых цифр (1–9), сакральных числовых сеток и матриц
   - Глубокий тёмно-синий/индиго фон (совпадает с `--navy` токеном проекта)
   - Тонкие золотые лучи и градиенты (perfect match c `--gradient-cosmic` / `--gradient-gold`)
   - Без санскрита, без чакр, без мандал, без человеческих фигур, без эзотерических символов
   - Эстетика: премиум финтех × астрология (Vogue × Bloomberg), не «эзотерический Etsy»
   - Квадрат 1024×1024 (hero рендерится в `aspect-square`)

2. **Сохраню** как `src/assets/quiz/hero-numerology.jpg`.

3. **Обновлю импорт** в `src/components/quiz/Quiz.tsx` (строка 15) — заменю `hero-cosmic.jpg` → `hero-numerology.jpg`, обновлю `alt` на `"Golden numerology blueprint"`.

4. **Удалю** старый `src/assets/quiz/hero-cosmic.jpg`.

## Что НЕ трогаю
- Текст заголовка, CTA, бейджи, layout Hero
- Milestone-картинки и report-cover
- Стили, токены, остальные компоненты квиза
- Логику, аналитику, paywall

## Файлы
- create: `src/assets/quiz/hero-numerology.jpg`
- edit: `src/components/quiz/Quiz.tsx` (1 строка импорта + alt)
- delete: `src/assets/quiz/hero-cosmic.jpg`
