const COINS = [
  { sym: 'BTC', name: '비트코인',   price: 84_500_000, chg: 2.4,  color: '#f7931a', amount: 0.085 },
  { sym: 'ETH', name: '이더리움',   price: 3_120_000,  chg: 3.8,  color: '#627eea', amount: 1.2 },
  { sym: 'SOL', name: '솔라나',     price: 192_000,    chg: -1.2, color: '#9945ff', amount: 8.5 },
  { sym: 'BNB', name: '바이낸스',   price: 412_000,    chg: 0.8,  color: '#f3ba2f', amount: 2.4 },
  { sym: 'XRP', name: '리플',       price: 624,        chg: -0.5, color: '#23292f', amount: 1240 },
  { sym: 'ADA', name: '카르다노',   price: 580,        chg: 1.4,  color: '#0033ad', amount: 800 },
];

function fmt(v) {
  if (v >= 10000) return v.toLocaleString('ko-KR');
  return v.toString();
}

// 인기 코인
const coinList = document.getElementById('coinList');
COINS.forEach((c, i) => {
  const el = document.createElement('li');
  el.className = 'coin' + (i === 0 ? ' active' : '');
  el.innerHTML = `
    <div class="coin-ic" style="background:${c.color}22;color:${c.color}">${c.sym[0]}</div>
    <div class="coin-info"><b>${c.name}</b><span>${c.sym}</span></div>
    <div class="coin-price">₩ ${fmt(c.price)}</div>
    <div class="coin-chg ${c.chg >= 0 ? 'up' : 'down'}">${c.chg >= 0 ? '▲' : '▼'} ${Math.abs(c.chg).toFixed(2)}%</div>
  `;
  el.addEventListener('click', () => {
    document.querySelectorAll('.coin').forEach((x) => x.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('chartCoin').textContent = `${c.sym} / KRW`;
    updateChart(c);
  });
  coinList.appendChild(el);
});

// 보유 자산
const holdings = document.getElementById('holdings');
let total = 0, totalCost = 0;
COINS.forEach((c) => {
  const avgPrice = c.price * (1 - c.chg / 100 * (0.5 + Math.random() * 1.5)); // 가짜 평단
  const value = c.price * c.amount;
  const cost = avgPrice * c.amount;
  const pnl = value - cost;
  const pct = (pnl / cost) * 100;
  total += value; totalCost += cost;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${c.sym} <span style="color:var(--muted);font-weight:400">${c.name}</span></td>
    <td>${c.amount}</td>
    <td>₩ ${fmt(Math.round(avgPrice))}</td>
    <td>₩ ${fmt(c.price)}</td>
    <td class="${pnl >= 0 ? 'up' : 'down'}">${pnl >= 0 ? '+' : ''}₩ ${fmt(Math.round(pnl))}</td>
    <td class="${pct >= 0 ? 'up' : 'down'}">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</td>
  `;
  holdings.appendChild(tr);
});

// 포트폴리오 카운트업
const portfolioEl = document.getElementById('portfolio');
const totalPnl = total - totalCost;
const totalPct = (totalPnl / totalCost) * 100;
let n = 0;
const step = total / 60;
const tt = setInterval(() => {
  n += step;
  if (n >= total) { n = total; clearInterval(tt); }
  portfolioEl.textContent = '₩ ' + Math.floor(n).toLocaleString('ko-KR');
}, 18);
const chgEl = document.getElementById('change');
chgEl.textContent = `${totalPnl >= 0 ? '▲' : '▼'} ₩ ${Math.abs(Math.floor(totalPnl)).toLocaleString('ko-KR')} (${totalPct >= 0 ? '+' : ''}${totalPct.toFixed(2)}%)`;
chgEl.className = 'change ' + (totalPnl >= 0 ? 'up' : 'down');

// 가격 차트
let chart;
function makeData(base, chg, n = 24) {
  const out = [];
  let v = base * (1 - chg / 100);
  for (let i = 0; i < n; i++) {
    v *= 1 + (Math.random() - 0.5 + chg / 100 / n) * 0.02;
    out.push(v);
  }
  out.push(base);
  return out;
}
function updateChart(c) {
  const data = makeData(c.price, c.chg);
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: {
      labels: data.map((_, i) => `${i}h`),
      datasets: [{
        data,
        borderColor: c.chg >= 0 ? '#16c784' : '#ea3943',
        backgroundColor: c.chg >= 0 ? 'rgba(22,199,132,.08)' : 'rgba(234,57,67,.08)',
        tension: .35, fill: true, pointRadius: 0, borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#1a2138' }, ticks: { color: '#8088a3', callback: (v) => '₩' + (v / 1_000_000).toFixed(1) + 'M' } },
        x: { grid: { display: false }, ticks: { color: '#8088a3', autoSkip: true, maxTicksLimit: 6 } },
      },
    },
  });
}
updateChart(COINS[0]);

// 시간 버튼 토글
document.querySelectorAll('.t-btn').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.t-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
  });
});

// 실시간 가격 시뮬레이션 (3초마다 ±0.3% 흔들기)
setInterval(() => {
  COINS.forEach((c) => { c.price *= 1 + (Math.random() - 0.5) * 0.006; });
  document.querySelectorAll('.coin').forEach((el, i) => {
    el.querySelector('.coin-price').textContent = '₩ ' + fmt(Math.round(COINS[i].price));
  });
}, 3000);
