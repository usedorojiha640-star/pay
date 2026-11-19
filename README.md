# BURO PAY — Business Design

Новый самостоятельный проект на React + Vite.

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Для Cloudflare Pages: build command `npm run build`, output directory `dist`.

## Настройки
- Telegram менеджера: `TG_URL` в `src/App.jsx`.
- Список валют: `CURRENCIES` в `src/App.jsx`.
- Курсы в `INITIAL_RATES` используются для **демонстрационного/справочного** расчёта. Фиатные курсы обновляются с публичного API, но курсы BTC и ETH остаются справочными. Не использовать калькулятор как источник гарантированных котировок.
- На мобильных устройствах предусмотрена адаптивная версия.
