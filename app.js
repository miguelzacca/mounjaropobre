// ── QUIZ DATA ──
const STEPS = [
  { id: 'intro', type: 'intro' },
  { id: 'name', type: 'text', q: 'Qual é o seu primeiro nome?', placeholder: 'Digite seu nome...', key: 'name' },
  { id: 'age', type: 'number', q: 'Quantos anos você tem?', placeholder: 'Sua idade', suffix: 'anos', key: 'age', min: 18, max: 99 },
  { id: 'height', type: 'number', q: 'Qual é a sua altura?', placeholder: 'Ex: 165', suffix: 'cm', key: 'height', min: 140, max: 220 },
  { id: 'weight', type: 'number', q: 'Qual é o seu peso atual?', placeholder: 'Ex: 85', suffix: 'kg', key: 'weight', min: 40, max: 250, showBMI: true },
  {
    id: 'duration', type: 'radio', q: 'Há quanto tempo você está acima do peso?', key: 'duration',
    opts: [{ v: '<1', l: 'Menos de 1 ano', ic: '📅' }, { v: '1-3', l: '1 a 3 anos', ic: '📆' }, { v: '3-5', l: '3 a 5 anos', ic: '🗓️' }, { v: '>5', l: 'Mais de 5 anos', ic: '⏳' }, { v: 'sempre', l: 'A vida toda', ic: '😔' }]
  },
  {
    id: 'attempts', type: 'radio', q: 'Você já tentou emagrecer antes?', key: 'attempts',
    opts: [{ v: 'nunca', l: 'Nunca tentei', ic: '🚫' }, { v: 'poucas', l: 'Poucas vezes', ic: '🤔' }, { v: 'muitas', l: 'Muitas vezes', ic: '😓' }, { v: 'agora', l: 'Estou tentando agora', ic: '💪' }]
  },
  {
    id: 'fail', type: 'checkbox', q: 'Por que não funcionou antes?', sub: 'Selecione tudo que se aplica', key: 'fail',
    opts: [{ v: 'fome', l: 'Fome descontrolada', ic: '🍔' }, { v: 'ansiedade', l: 'Ansiedade por comida', ic: '😰' }, { v: 'metabolismo', l: 'Metabolismo lento', ic: '🐢' }, { v: 'tempo', l: 'Falta de tempo', ic: '⏰' }, { v: 'caro', l: 'Muito caro', ic: '💸' }, { v: 'efeitos', l: 'Efeitos colaterais', ic: '⚠️' }],
    skip: d => d.attempts === 'nunca'
  },
  {
    id: 'health', type: 'checkbox', q: 'Você tem algum desses problemas de saúde?', sub: 'Selecione tudo que se aplica', key: 'health',
    opts: [{ v: 'pressao', l: 'Pressão alta', ic: '❤️' }, { v: 'diabetes', l: 'Diabetes ou pré-diabetes', ic: '🩸' }, { v: 'colesterol', l: 'Colesterol alto', ic: '🔴' }, { v: 'articulacoes', l: 'Dores nas articulações', ic: '🦴' }, { v: 'apneia', l: 'Apneia do sono', ic: '😴' }, { v: 'nenhum', l: 'Nenhum desses', ic: '✅' }]
  },
  {
    id: 'impact', type: 'checkbox', q: 'Como o excesso de peso impacta sua vida?', sub: 'Selecione tudo que se aplica', key: 'impact',
    opts: [{ v: 'autoestima', l: 'Autoestima baixa', ic: '😞' }, { v: 'relacionamentos', l: 'Relacionamentos afetados', ic: '💔' }, { v: 'roupas', l: 'Roupas que não servem', ic: '👗' }, { v: 'cansaco', l: 'Cansaço excessivo', ic: '😴' }, { v: 'exercicio', l: 'Dificuldade para se exercitar', ic: '🏃' }, { v: 'espelho', l: 'Evito me olhar no espelho', ic: '🪞' }]
  },
  { id: 'energy', type: 'scale', q: 'Como está seu nível de energia diário?', key: 'energy', min: 1, max: 5, labelL: 'Sem energia', labelR: 'Muita energia' },
  {
    id: 'goal', type: 'radio', q: 'Quanto peso você quer perder?', key: 'goal',
    opts: [{ v: '5-10', l: '5 a 10 kg', ic: '🎯' }, { v: '10-20', l: '10 a 20 kg', ic: '🎯' }, { v: '20-30', l: '20 a 30 kg', ic: '🎯' }, { v: '>30', l: 'Mais de 30 kg', ic: '🎯' }]
  },
  { id: 'contact', type: 'contact', q: 'Para onde enviamos seus resultados?', sub: '🔒 100% seguro e protegido' }
];

// ── PERSISTENCE (localStorage) ──
const LS_KEY = 'monjaro_quiz_v1';

function saveProgress() {
  localStorage.setItem(LS_KEY, JSON.stringify({ stepIdx, data }));
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved && typeof saved.stepIdx === 'number') {
      Object.assign(data, saved.data || {});
      return saved.stepIdx;
    }
  } catch {}
  return 0;
}

function clearProgress() {
  localStorage.removeItem(LS_KEY);
}

// ── STATE ──
const data = {};
let stepIdx = loadProgress();

// If quiz was already finished (stepIdx >= STEPS.length), go straight to page
const quizAlreadyDone = stepIdx >= STEPS.length;

// ── BMI ──
function calcBMI(h, w) { return w / ((h / 100) ** 2); }
function bmiClass(b) {
  if (b < 18.5) return { cls: 'Abaixo do peso', css: 'bmi-ok', bar: '8%', risks: [] };
  if (b < 25) return { cls: 'Peso Normal', css: 'bmi-ok', bar: '25%', risks: [] };
  if (b < 30) return { cls: 'Sobrepeso', css: 'bmi-sobrepeso', bar: '45%', risks: ['Risco cardiovascular moderado', 'Possível resistência à insulina'] };
  if (b < 35) return { cls: 'Obesidade Grau I', css: 'bmi-ob1', bar: '60%', risks: ['Risco cardiovascular alto', 'Diabetes tipo 2', 'Hipertensão'] };
  if (b < 40) return { cls: 'Obesidade Grau II', css: 'bmi-ob2', bar: '78%', risks: ['Risco cardiovascular muito alto', 'Diabetes', 'AVC', 'Apneia do sono'] };
  return { cls: 'Obesidade Grau III', css: 'bmi-ob3', bar: '93%', risks: ['Risco de vida', 'Diabetes grave', 'AVC', 'Doença cardíaca', 'Morte precoce'] };
}

// ── RENDER QUIZ ──
function render() {
  const step = STEPS[stepIdx];
  const pct = Math.round((stepIdx / (STEPS.length - 1)) * 100);
  document.querySelector('.quiz-progress-fill').style.width = pct + '%';
  document.querySelector('.quiz-progress-text').textContent = `Etapa ${stepIdx + 1} de ${STEPS.length}`;
  document.querySelector('.quiz-card').innerHTML = buildStep(step);
  bindStep(step);
  document.querySelector('.quiz-card').scrollTop = 0;
}

function buildStep(s) {
  // Restart button (shown on all steps except intro)
  const restartBtn = stepIdx > 0
    ? `<button class="btn-restart" id="btn-restart" title="Recomeçar do início">↺ Recomeçar</button>`
    : '';

  if (s.type === 'intro') return `
    <span class="intro-icon">⚖️</span>
    <p class="step-label">Avaliação Gratuita</p>
    <h2>Descubra por que você não consegue emagrecer — e o que fazer</h2>
    <p class="step-sub">Responda 13 perguntas rápidas. Em menos de 3 minutos, você terá um diagnóstico personalizado.</p>
    <ul class="intro-bullets">
      <li><span class="ic">🧮</span> Cálculo do seu IMC e nível de risco</li>
      <li><span class="ic">🔍</span> Identificação dos seus bloqueios</li>
      <li><span class="ic">💊</span> Receita natural que replica o Monjaro</li>
      <li><span class="ic">⚡</span> Resultados em até 14 dias</li>
    </ul>
    <div class="quiz-nav"><button class="btn-next" id="btn-start">Começar Avaliação Gratuita →</button></div>`;

  if (s.type === 'text') return `
    ${restartBtn}
    <p class="step-label">Sobre você</p><h2>${s.q}</h2>
    <input class="quiz-input" id="q-input" type="text" placeholder="${s.placeholder}" value="${data[s.key] || ''}">
    ${navHtml(stepIdx)}`;

  if (s.type === 'number') {
    const bmiHtml = s.showBMI && data.height ? buildBmiPreview() : '';
    return `
      ${restartBtn}
      <p class="step-label">Sobre você</p><h2>${s.q}</h2>
      <div class="input-suffix">
        <input class="quiz-input" id="q-input" type="number" placeholder="${s.placeholder}" value="${data[s.key] || ''}" min="${s.min}" max="${s.max}">
        <span class="sfx">${s.suffix}</span>
      </div>
      <div id="bmi-preview-wrap">${bmiHtml}</div>
      ${navHtml(stepIdx)}`;
  }

  if (s.type === 'radio') return `
    ${restartBtn}
    <p class="step-label">Sobre você</p><h2>${s.q}</h2>
    <div class="options-grid">${s.opts.map(o => `
      <button class="option-btn${data[s.key] === o.v ? ' selected' : ''}" data-val="${o.v}">
        <span class="opt-ic">${o.ic}</span>${o.l}<span class="opt-check"></span>
      </button>`).join('')}</div>
    ${navHtml(stepIdx)}`;

  if (s.type === 'checkbox') return `
    ${restartBtn}
    <p class="step-label">Sobre você</p><h2>${s.q}</h2>
    ${s.sub ? `<p class="step-sub">${s.sub}</p>` : ''}
    <div class="options-grid">${s.opts.map(o => `
      <button class="option-btn${(data[s.key] || []).includes(o.v) ? ' selected' : ''}" data-val="${o.v}" data-multi="1">
        <span class="opt-ic">${o.ic}</span>${o.l}<span class="opt-check"></span>
      </button>`).join('')}</div>
    ${navHtml(stepIdx)}`;

  if (s.type === 'scale') return `
    ${restartBtn}
    <p class="step-label">Sobre você</p><h2>${s.q}</h2>
    <div class="scale-labels"><span>${s.labelL}</span><span>${s.labelR}</span></div>
    <div class="scale-btns">${[1, 2, 3, 4, 5].map(n => `
      <button class="scale-btn${data[s.key] === n ? ' selected' : ''}" data-val="${n}">${n}</button>`).join('')}</div>
    ${navHtml(stepIdx)}`;

  if (s.type === 'contact') return `
    ${restartBtn}
    <p class="step-label">Quase lá!</p><h2>${s.q}</h2>
    <p class="step-sub">${s.sub}</p>
    <div class="contact-fields">
      <div class="field-wrap"><label>E-mail</label><input class="quiz-input" id="inp-email" type="email" placeholder="seu@email.com" value="${data.email || ''}"></div>
      <div class="field-wrap"><label>WhatsApp</label><input class="quiz-input" id="inp-phone" type="tel" placeholder="(11) 99999-9999" value="${data.phone || ''}"></div>
    </div>
    ${navHtml(stepIdx, 'Ver meu diagnóstico →')}`;

  return '';
}

function navHtml(idx, nextLabel) {
  const back = idx > 0 ? `<button class="btn-back" id="btn-back">← Voltar</button>` : '';
  return `<div class="quiz-nav">${back}<button class="btn-next" id="btn-next">${nextLabel || 'Continuar →'}</button></div>`;
}

function buildBmiPreview() {
  if (!data.height || !data.weight) return '';
  const b = calcBMI(+data.height, +data.weight);
  const bc = bmiClass(b);
  return `<div class="bmi-preview">
    <div class="bmi-num">${b.toFixed(1)}</div>
    <div class="bmi-label">Seu IMC<br><span class="bmi-class">${bc.cls}</span></div>
  </div>`;
}

function bindStep(s) {
  const card = document.querySelector('.quiz-card');
  const next = () => advance(s);
  const back = () => { stepIdx--; saveProgress(); render(); };

  card.querySelector('#btn-start')?.addEventListener('click', () => { stepIdx++; saveProgress(); render(); });
  card.querySelector('#btn-back')?.addEventListener('click', back);
  card.querySelector('#btn-next')?.addEventListener('click', () => next());

  // Restart button
  card.querySelector('#btn-restart')?.addEventListener('click', () => {
    if (confirm('Tem certeza que quer recomeçar do início? Suas respostas serão apagadas.')) {
      restartQuiz();
    }
  });

  if (s.type === 'text') {
    const inp = card.querySelector('#q-input');
    inp.focus();
    inp.addEventListener('keydown', e => e.key === 'Enter' && next());
  }

  if (s.type === 'number') {
    const inp = card.querySelector('#q-input');
    inp.focus();
    inp.addEventListener('input', () => {
      data[s.key] = +inp.value;
      if (s.showBMI) document.getElementById('bmi-preview-wrap').innerHTML = buildBmiPreview();
    });
    inp.addEventListener('keydown', e => e.key === 'Enter' && next());
  }

  if (s.type === 'radio') {
    card.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        data[s.key] = btn.dataset.val;
        saveProgress();
        setTimeout(() => next(), 280);
      });
    });
  }

  if (s.type === 'checkbox') {
    card.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.val;
        if (!data[s.key]) data[s.key] = [];
        if (v === 'nenhum') {
          data[s.key] = [v];
          card.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          return;
        }
        data[s.key] = data[s.key].filter(x => x !== 'nenhum');
        const idx2 = data[s.key].indexOf(v);
        if (idx2 > -1) { data[s.key].splice(idx2, 1); btn.classList.remove('selected'); }
        else { data[s.key].push(v); btn.classList.add('selected'); }
        card.querySelectorAll('.option-btn[data-val="nenhum"]').forEach(b => b.classList.remove('selected'));
      });
    });
  }

  if (s.type === 'scale') {
    card.querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        data[s.key] = +btn.dataset.val;
        saveProgress();
      });
    });
  }
}

function advance(s) {
  const card = document.querySelector('.quiz-card');
  if (s.type === 'text') {
    const v = card.querySelector('#q-input').value.trim();
    if (!v) return shake();
    data[s.key] = v;
  }
  if (s.type === 'number') {
    const v = +card.querySelector('#q-input').value;
    if (!v || v < s.min || v > s.max) return shake();
    data[s.key] = v;
  }
  if (s.type === 'radio' && !data[s.key]) return shake();
  if (s.type === 'scale' && !data[s.key]) return shake();
  if (s.type === 'contact') {
    const em = card.querySelector('#inp-email').value.trim();
    const ph = card.querySelector('#inp-phone').value.trim();
    if (!em || !em.includes('@')) return shake();
    data.email = em; data.phone = ph;
  }

  stepIdx++;
  const next = STEPS[stepIdx];
  if (next?.skip && next.skip(data)) stepIdx++;

  saveProgress();

  if (stepIdx >= STEPS.length) return finishQuiz();
  render();
}

function shake() {
  const card = document.querySelector('.quiz-card');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'shake .4s ease';
}

function restartQuiz() {
  // Clear all data keys
  Object.keys(data).forEach(k => delete data[k]);
  stepIdx = 0;
  clearProgress();
  // Hide main, show quiz
  document.getElementById('main-content').classList.remove('visible');
  document.getElementById('quiz-overlay').classList.remove('hidden');
  render();
}

function finishQuiz() {
  // Mark as done (stepIdx = STEPS.length) in localStorage
  saveProgress();
  document.getElementById('quiz-overlay').classList.add('hidden');
  const main = document.getElementById('main-content');
  main.classList.add('visible');
  populatePage();
  initFadeObserver();
}

// ── POPULATE MAIN PAGE ──
function populatePage() {
  const name = data.name || 'Você';
  const h = +data.height, w = +data.weight;
  const bmi = h && w ? calcBMI(h, w) : null;
  const bc = bmi ? bmiClass(bmi) : null;

  document.getElementById('hero-name').textContent = name.split(' ')[0] + ',';
  if (bmi) {
    document.getElementById('hero-sub').textContent =
      `Seu IMC é ${bmi.toFixed(1)} — ${bc.cls}. Veja o que isso significa para sua saúde e como resolver.`;
    const bmiCard = document.getElementById('bmi-result-card');
    bmiCard.className = 'bmi-result-card ' + bc.css;
    bmiCard.querySelector('.bmi-big').textContent = bmi.toFixed(1);
    bmiCard.querySelector('.bmi-classification').textContent = bc.cls;
    bmiCard.querySelector('.bmi-marker').style.left = bc.bar;
    const risksWrap = bmiCard.querySelector('.bmi-risks');
    risksWrap.innerHTML = bc.risks.map(r =>
      `<span class="bmi-risk-tag${bc.css.includes('ob') ? ' risk-high' : ''}">${r}</span>`
    ).join('');
  }

  document.getElementById('chk-name').value = data.name || '';
  document.getElementById('chk-email').value = data.email || '';
  document.getElementById('chk-phone').value = data.phone || '';
}

// ── FAQ ACCORDION ──
document.addEventListener('click', e => {
  const q = e.target.closest('.faq-q');
  if (!q) return;
  q.closest('.faq-item').classList.toggle('open');
});

// ── "Refazer quiz" button on main page ──
document.getElementById('btn-refazer')?.addEventListener('click', () => {
  if (confirm('Quer refazer o quiz do início?')) restartQuiz();
});

// ── CHECKOUT MODAL ──
function openCheckout() {
  document.getElementById('checkout-modal').classList.add('open');
}
function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
}
document.querySelectorAll('.btn-buy, .btn-hero').forEach(b => b.addEventListener('click', openCheckout));
document.getElementById('modal-close-btn')?.addEventListener('click', closeCheckout);
document.getElementById('checkout-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('checkout-modal')) closeCheckout();
});

document.getElementById('checkout-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('btn-checkout-submit');
  btn.disabled = true; btn.textContent = 'Gerando pagamento...';

  const h = +data.height, w = +data.weight;
  const bmi = h && w ? calcBMI(h, w) : null;
  const bc = bmi ? bmiClass(bmi) : null;

  const payload = {
    name: document.getElementById('chk-name').value,
    email: document.getElementById('chk-email').value,
    phone: document.getElementById('chk-phone').value,
    cpf: document.getElementById('chk-cpf').value,
    imc: bmi?.toFixed(1),
    imcClass: bc?.cls,
    quizData: data
  };

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.paymentUrl) {
      window.location.href = json.paymentUrl;
    } else {
      alert(json.error || 'Erro ao gerar pagamento. Tente novamente.');
      btn.disabled = false; btn.textContent = 'Finalizar Compra →';
    }
  } catch {
    alert('Erro de conexão. Tente novamente.');
    btn.disabled = false; btn.textContent = 'Finalizar Compra →';
  }
});

// ── SCROLL ANIMATIONS ──
function initFadeObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(el => { if (el.isIntersecting) { el.target.classList.add('visible'); obs.unobserve(el.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

// ── MASKS ──
document.getElementById('chk-cpf')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  e.target.value = v;
});
document.getElementById('chk-phone')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  e.target.value = v;
});

// ── INIT ──
if (quizAlreadyDone) {
  // Quiz already completed — go straight to page
  document.getElementById('quiz-overlay').classList.add('hidden');
  document.getElementById('main-content').classList.add('visible');
  populatePage();
  initFadeObserver();
} else {
  render();
}
