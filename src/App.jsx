import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, ArrowUpRight, Check, ChevronDown, Clock3, Headphones, LockKeyhole, Menu, ShieldCheck, X } from 'lucide-react';

const TG_URL = 'https://t.me/cashers_manager_1'; // Замените при необходимости
const CURRENCIES = [
  { code: 'USD', name: 'Доллар США', type: 'fiat' },
  { code: 'EUR', name: 'Евро', type: 'fiat' },
  { code: 'RUB', name: 'Российский рубль', type: 'fiat' },
  { code: 'CNY', name: 'Китайский юань', type: 'fiat' },
  { code: 'KZT', name: 'Казахстанский тенге', type: 'fiat' },
  { code: 'USDT', name: 'Tether', type: 'crypto' },
  { code: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { code: 'ETH', name: 'Ethereum', type: 'crypto' },
];
// Единицы соответствующей валюты за 1 USD. Значения используются как ориентир,
// не являются офертой или подтверждённым курсом обмена.
const INITIAL_RATES = { USD: 1, EUR: 0.92, RUB: 92.5, CNY: 7.25, KZT: 470, USDT: 1, BTC: 0.0000122, ETH: 0.00032 };
const isCrypto = (code) => CURRENCIES.find(c => c.code === code)?.type === 'crypto';
function spreadFor(from, to) {
  if (isCrypto(from) && !isCrypto(to)) return 1.025;
  if (!isCrypto(from) && isCrypto(to)) return 0.97;
  return 1;
}
function formatAmount(value, code) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: ['BTC', 'ETH'].includes(code) ? 8 : 2, minimumFractionDigits: ['BTC', 'ETH'].includes(code) ? 0 : 2 }).format(value);
}
function CurrencyPicker({ value, onChange, label }) {
  return (
    <label className="currency-picker">
      <span className="sr-only">{label}: валюта</span>
      <select aria-label={`${label}: валюта`} value={value} onChange={e => onChange(e.target.value)}>
        {CURRENCIES.map(c => <option value={c.code} key={c.code}>{c.code}</option>)}
      </select>
      <ChevronDown aria-hidden="true" size={16} />
    </label>
  );
}
export default function App() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('USDT');
  const [amount, setAmount] = useState('1000');
  const [rates, setRates] = useState(INITIAL_RATES);
  const [ratesState, setRatesState] = useState('Ориентировочный расчёт');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('Rates unavailable'); return r.json(); })
      .then(data => {
        const fx = data?.usd;
        if (!fx) throw new Error('Invalid rates');
        setRates(previous => ({ ...previous, ...Object.fromEntries([['EUR','eur'],['RUB','rub'],['CNY','cny'],['KZT','kzt']].map(([code, key]) => [code, Number(fx[key]) || previous[code]])) }));
        setRatesState('Фиатные котировки обновлены · криптовалюты ориентировочно');
      })
      .catch(error => { if (error.name !== 'AbortError') setRatesState('Ориентировочный расчёт · справочные значения'); });
    return () => controller.abort();
  }, []);

  const numericAmount = Number(amount);
  const validAmount = amount.trim() !== '' && Number.isFinite(numericAmount) && numericAmount > 0;
  const result = useMemo(() => validAmount ? numericAmount / rates[from] * rates[to] * spreadFor(from, to) : 0, [validAmount, numericAmount, rates, from, to]);
  const unitRate = rates[to] / rates[from] * spreadFor(from, to);
  const telegramMessage = `Здравствуйте! Хочу уточнить актуальный курс и условия обмена: ${validAmount ? amount : '—'} ${from} → ${to}. Ориентировочный расчёт: ${validAmount ? formatAmount(result, to) : '—'} ${to}.`;
  const tgLink = `${TG_URL}?text=${encodeURIComponent(telegramMessage)}`;

  function swap() { setFrom(to); setTo(from); }

  return (
    <div className="site">
      <header className="topbar">
        <div className="wrap header-inner">
          <a className="brand" href="#top" aria-label="BURO PAY — наверх"><span className="brand-mark">B<span>.</span></span><span className="brand-name">BURO <strong>PAY</strong><small>ЦИФРОВЫЕ АКТИВЫ</small></span></a>
          <nav className={`nav ${mobileMenu ? 'nav-open' : ''}`} aria-label="Основная навигация">
            <a href="#exchange" onClick={() => setMobileMenu(false)}>Обмен валют</a>
            <a href="#advantages" onClick={() => setMobileMenu(false)}>Преимущества</a>
            <a href="#process" onClick={() => setMobileMenu(false)}>Как это работает</a>
          </nav>
          <a className="header-contact" href={TG_URL} target="_blank" rel="noopener noreferrer">Связаться с менеджером <ArrowUpRight size={15} /></a>
          <button className="menu-button" type="button" aria-label={mobileMenu ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(v => !v)}>{mobileMenu ? <X size={23}/> : <Menu size={23}/>}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot"/> СЕРВИС ОБМЕНА ЦИФРОВЫХ АКТИВОВ</div>
              <h1>Обмен активов.<br/><span>Деловой подход.</span></h1>
              <p className="hero-lead">Прозрачный процесс обмена криптовалют и фиатных средств. Узнайте ориентировочную сумму и согласуйте актуальный курс с менеджером.</p>
              <div className="hero-meta"><span><Check size={17}/> Индивидуальные условия</span><span><Check size={17}/> Поддержка 24/7</span></div>
              <div className="hero-footer"><div className="thin-line"/><div><span className="hero-footer-kicker">BURO PAY</span><span>Надёжная коммуникация на каждом этапе операции</span></div></div>
            </div>

            <div className="exchange-card" id="exchange">
              <div className="exchange-heading"><div><span className="section-eyebrow">КАЛЬКУЛЯТОР ОБМЕНА</span><h2>Рассчитать обмен</h2></div><span className="exchange-tag">Предварительно</span></div>
              <p className="exchange-intro">Укажите сумму и валютную пару</p>
              <div className="field-label">Вы отдаёте</div>
              <div className="amount-field"><input aria-label="Сумма, которую отдаёте" inputMode="decimal" type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)} /><CurrencyPicker label="Отдаёте" value={from} onChange={setFrom}/></div>
              <div className="swap-line"><span/><button type="button" className="swap-button" aria-label="Поменять валюты местами" onClick={swap}><ArrowDownUp size={19}/></button><span/></div>
              <div className="field-label">Вы получаете</div>
              <div className="amount-field output"><div role="status" className="result-amount">{validAmount ? formatAmount(result, to) : '0,00'}</div><CurrencyPicker label="Получаете" value={to} onChange={setTo}/></div>
              <div className="rate-panel"><div className="rate-line"><span>Расчётный курс</span><strong>1 {from} ≈ {formatAmount(unitRate, to)} {to}</strong></div><div className="rate-line"><span>Статус котировок</span><span className="rate-muted">{ratesState}</span></div></div>
              <a className="primary-button" href={tgLink} target="_blank" rel="noopener noreferrer">Запросить актуальный курс <ArrowUpRight size={19}/></a>
              <p className="calc-disclaimer">Расчёт носит информационный характер. Криптовалютные котировки в демо-версии справочные; окончательные условия подтверждает менеджер.</p>
            </div>
          </div>
        </section>

        <section className="benefits-section" id="advantages"><div className="wrap"><div className="section-head"><div><span className="section-eyebrow">ПОЧЕМУ BURO PAY</span><h2>Когда важны детали</h2></div><p>Простой понятный процесс, без лишних шагов.</p></div><div className="benefits-grid">
          <div className="benefit"><div className="benefit-icon"><ShieldCheck size={22}/></div><span className="benefit-index">01</span><h3>Контроль операции</h3><p>Условия и порядок проведения обмена согласовываются до начала операции.</p></div>
          <div className="benefit"><div className="benefit-icon"><Clock3 size={22}/></div><span className="benefit-index">02</span><h3>Оперативная связь</h3><p>Оставьте запрос и уточните детали напрямую у менеджера сервиса.</p></div>
          <div className="benefit"><div className="benefit-icon"><LockKeyhole size={22}/></div><span className="benefit-index">03</span><h3>Конфиденциальность</h3><p>Обсуждение параметров сделки в персональном диалоге.</p></div>
        </div></div></section>

        <section className="process-section" id="process"><div className="wrap process-inner"><div><span className="section-eyebrow">ПРОЦЕСС ОБМЕНА</span><h2>Три простых шага</h2></div><div className="steps"><div><b>01</b><span>Выберите валютную пару и сумму</span></div><div><b>02</b><span>Запросите актуальный курс в Telegram</span></div><div><b>03</b><span>Согласуйте условия с менеджером</span></div></div></div></section>

        <section className="bottom-cta"><div className="wrap bottom-cta-inner"><div><span className="section-eyebrow">ЕСТЬ ВОПРОСЫ?</span><h2>Обсудим ваш обмен</h2><p>Менеджер поможет уточнить курс, доступность направления и порядок проведения операции.</p></div><a href={TG_URL} target="_blank" rel="noopener noreferrer">Связаться в Telegram <ArrowUpRight size={18}/></a></div></section>
      </main>
      <footer className="footer"><div className="wrap footer-inner"><a href="#top" className="footer-brand">BURO <strong>PAY</strong></a><span>© {new Date().getFullYear()} BURO PAY</span><span>Информация на сайте не является публичной офертой.</span></div></footer>
    </div>
  );
}
