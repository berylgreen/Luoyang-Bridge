/* ============================================================
   跨海飞虹 — 主控逻辑
   Main: 初始化所有模块 & 导航交互
   ============================================================ */
const App = {
  charts: [],

  init() {
    // 等待DOM完全加载
    this.initNavigation();
    ScrollAnimations.init();
    BridgeInteractive.init();
    this.initCharts();
    this.initSmoothScroll();
    console.log('🌉 跨海飞虹 — 洛阳桥交互图鉴 已加载');
  },

  // ---------- 导航链接点击 ----------
  initNavigation() {
    document.querySelectorAll('.nav__link[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        const target = document.getElementById(targetId);
        if (target) {
          const navH = document.querySelector('.nav')?.offsetHeight || 60;
          window.scrollTo({
            top: target.offsetTop - navH - 20,
            behavior: 'smooth'
          });
        }
      });
    });
  },

  // ---------- 平滑滚动到锚点 ----------
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href').substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  },

  // ---------- 按需加载图表 ----------
  initCharts() {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          this.loadChart(id);
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '200px 0px' });

    document.querySelectorAll('.chart-box').forEach(el => {
      chartObserver.observe(el);
    });
  },

  loadChart(id) {
    try {
      let chart;
      switch (id) {
        case 'chart-trade':
          chart = ChartConfigs.tradeChart(id); break;
        case 'chart-mechanics':
          chart = ChartConfigs.mechanicsRadar(id); break;
        case 'chart-restoration':
          chart = ChartConfigs.restorationTimeline(id); break;
        case 'chart-material':
          chart = ChartConfigs.materialPie(id); break;
        case 'chart-tidal':
          chart = ChartConfigs.tidalChart(id); break;
        case 'chart-comparison':
          chart = ChartConfigs.comparisonBar(id); break;
      }
      if (chart) this.charts.push(chart);
    } catch (e) {
      console.warn('Chart load error:', id, e);
    }
  },
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());
// 窗口resize自适应图表
window.addEventListener('resize', () => {
  App.charts.forEach(c => { if (c && !c.isDisposed()) c.resize(); });
});
