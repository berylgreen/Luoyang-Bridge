/* ============================================================
   跨海飞虹 — ECharts 图表配置
   Charts: 所有数据可视化图表
   ============================================================ */

const ChartConfigs = {
  // 通用主题色
  themeColors: {
    gold: '#C9A84C',
    goldLight: '#D4B978',
    copper: '#C0653A',
    copperLight: '#D48A6A',
    tide: '#3D8B8B',
    tideLight: '#5AB5B0',
    stone: '#6B8C9A',
    stoneLight: '#8BAAB5',
    bg: 'rgba(15, 20, 35, 0.6)',
    text: '#B0A89C',
    textMuted: '#6B7280',
    borderColor: 'rgba(201, 168, 76, 0.15)',
    gridLine: 'rgba(100, 116, 139, 0.1)',
  },

  // 通用tooltip主题
  tooltipTheme: {
    backgroundColor: 'rgba(15, 20, 35, 0.92)',
    borderColor: 'rgba(201, 168, 76, 0.25)',
    borderWidth: 1,
    textStyle: {
      color: '#B0A89C',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: 13,
    },
    extraCssText: 'backdrop-filter: blur(12px); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);'
  },

  // ==================================
  // 图表1：宋代泉州港贸易数据
  // ==================================
  tradeChart(containerId) {
    const chart = echarts.init(document.getElementById(containerId));
    const data = BridgeData.quanzhouTrade.data;

    const option = {
      tooltip: {
        ...this.tooltipTheme,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['商船数量（艘/年）', '贸易额（万缗）'],
        top: 10,
        textStyle: { color: this.themeColors.text, fontSize: 12 },
        itemGap: 24,
      },
      grid: {
        left: '3%', right: '4%', bottom: '8%', top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.period),
        axisLabel: {
          color: this.themeColors.textMuted,
          fontSize: 11,
          interval: 0,
          rotate: 15,
        },
        axisLine: { lineStyle: { color: this.themeColors.gridLine } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: '商船（艘）',
          nameTextStyle: { color: this.themeColors.textMuted, fontSize: 11 },
          axisLabel: { color: this.themeColors.textMuted, fontSize: 11 },
          splitLine: { lineStyle: { color: this.themeColors.gridLine } },
          axisLine: { show: false },
        },
        {
          type: 'value',
          name: '贸易额（万缗）',
          nameTextStyle: { color: this.themeColors.textMuted, fontSize: 11 },
          axisLabel: { color: this.themeColors.textMuted, fontSize: 11 },
          splitLine: { show: false },
          axisLine: { show: false },
        }
      ],
      series: [
        {
          name: '商船数量（艘/年）',
          type: 'bar',
          data: data.map(d => d.ships),
          barWidth: '30%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: this.themeColors.tideLight },
              { offset: 1, color: this.themeColors.tide }
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(61,139,139,0.4)' }
          },
          animationDelay: idx => idx * 200,
        },
        {
          name: '贸易额（万缗）',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => d.tradeVolume),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: this.themeColors.gold,
            width: 3,
          },
          itemStyle: { color: this.themeColors.gold },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(201, 168, 76, 0.25)' },
              { offset: 1, color: 'rgba(201, 168, 76, 0.02)' }
            ])
          },
          animationDelay: idx => idx * 200 + 100,
        }
      ],
      animationEasing: 'cubicOut',
      animationDuration: 1500,
    };

    chart.setOption(option);
    return chart;
  },

  // ==================================
  // 图表2：力学参数雷达图
  // ==================================
  mechanicsRadar(containerId) {
    const chart = echarts.init(document.getElementById(containerId));

    const option = {
      tooltip: { ...this.tooltipTheme },
      radar: {
        indicator: [
          { name: '抗潮汐能力', max: 100 },
          { name: '承载力', max: 100 },
          { name: '抗冲击性', max: 100 },
          { name: '耐久性', max: 100 },
          { name: '生态友好', max: 100 },
          { name: '建造技巧', max: 100 }
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: this.themeColors.text,
          fontSize: 12,
          fontFamily: "'Noto Serif SC', serif",
        },
        splitArea: {
          areaStyle: {
            color: [
              'rgba(201, 168, 76, 0.02)',
              'rgba(201, 168, 76, 0.04)',
              'rgba(201, 168, 76, 0.06)',
              'rgba(201, 168, 76, 0.08)',
            ]
          }
        },
        splitLine: { lineStyle: { color: this.themeColors.gridLine } },
        axisLine: { lineStyle: { color: this.themeColors.gridLine } },
      },
      series: [
        {
          name: '洛阳桥工程评估',
          type: 'radar',
          data: [
            {
              value: [92, 88, 85, 98, 95, 96],
              name: '洛阳桥',
              lineStyle: { color: this.themeColors.gold, width: 2 },
              itemStyle: { color: this.themeColors.gold },
              areaStyle: { color: 'rgba(201, 168, 76, 0.2)' },
            },
            {
              value: [45, 70, 60, 75, 30, 65],
              name: '同期西方桥梁(平均)',
              lineStyle: { color: this.themeColors.stone, width: 1, type: 'dashed' },
              itemStyle: { color: this.themeColors.stone },
              areaStyle: { color: 'rgba(107, 140, 154, 0.1)' },
            }
          ]
        }
      ],
      animationDuration: 2000,
    };

    chart.setOption(option);
    return chart;
  },

  // ==================================
  // 图表3：历代修缮时间散点图
  // ==================================
  restorationTimeline(containerId) {
    const chart = echarts.init(document.getElementById(containerId));
    const data = BridgeData.restorations;

    const dynastyColors = {
      '南宋': '#5AB5B0',
      '元': '#C0653A',
      '明': '#C9A84C',
      '清': '#8BAAB5',
      '民国': '#D48A6A',
      '中华人民共和国': '#E85D5D'
    };

    const getDynastyKey = (dynasty) => {
      for (const key of Object.keys(dynastyColors)) {
        if (dynasty.includes(key)) return key;
      }
      return '其他';
    };

    const option = {
      tooltip: {
        ...this.tooltipTheme,
        formatter: params => {
          const d = data[params.dataIndex];
          return `<div style="font-family:'Noto Serif SC',serif;font-size:14px;color:#C9A84C;margin-bottom:6px">${d.dynasty}</div>
                  <div style="font-size:12px;color:#B0A89C;line-height:1.6">${d.description}</div>`;
        }
      },
      grid: {
        left: '6%', right: '4%', bottom: '12%', top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        min: 1100,
        max: 2050,
        name: '年份',
        nameLocation: 'center',
        nameGap: 35,
        nameTextStyle: { color: this.themeColors.textMuted, fontSize: 12 },
        axisLabel: { color: this.themeColors.textMuted, fontSize: 11 },
        splitLine: { lineStyle: { color: this.themeColors.gridLine } },
        axisLine: { lineStyle: { color: this.themeColors.gridLine } },
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: 10,
      },
      series: [{
        type: 'scatter',
        data: data.map((d, i) => [d.year, 3 + Math.sin(i) * 2.5, getDynastyKey(d.dynasty)]),
        symbolSize: d => {
          if (d[0] >= 1900) return 20;
          return 14;
        },
        itemStyle: {
          color: params => {
            const key = data[params.dataIndex] ? getDynastyKey(data[params.dataIndex].dynasty) : '#C9A84C';
            return dynastyColors[key] || '#C9A84C';
          },
          shadowBlur: 8,
          shadowColor: 'rgba(201, 168, 76, 0.3)',
        },
        emphasis: {
          itemStyle: { shadowBlur: 20 },
          scale: 1.8
        },
        animationDelay: idx => idx * 120,
      }],
      animationDuration: 1500,
      animationEasing: 'cubicOut',
    };

    chart.setOption(option);
    return chart;
  },

  // ==================================
  // 图表4：桥梁结构材料占比饼图
  // ==================================
  materialPie(containerId) {
    const chart = echarts.init(document.getElementById(containerId));

    const option = {
      tooltip: { ...this.tooltipTheme },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(15,20,35,0.8)',
          borderWidth: 3,
        },
        label: {
          color: this.themeColors.text,
          fontSize: 12,
          fontFamily: "'Noto Sans SC', sans-serif",
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          lineStyle: { color: this.themeColors.textMuted }
        },
        emphasis: {
          label: { fontSize: 14, fontWeight: 'bold', color: this.themeColors.gold }
        },
        data: [
          { value: 45, name: '花岗岩石板梁', itemStyle: { color: this.themeColors.gold } },
          { value: 25, name: '桥墩基石', itemStyle: { color: this.themeColors.stone } },
          { value: 15, name: '筏型基础抛石', itemStyle: { color: this.themeColors.tide } },
          { value: 10, name: '牡蛎生物胶结', itemStyle: { color: this.themeColors.copper } },
          { value: 5, name: '石栏杆与雕塑', itemStyle: { color: this.themeColors.stoneLight } },
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 2000,
      }]
    };

    chart.setOption(option);
    return chart;
  },

  // ==================================
  // 图表5：潮汐模拟折线图
  // ==================================
  tidalChart(containerId) {
    const chart = echarts.init(document.getElementById(containerId));

    // 模拟24小时潮汐数据（双峰型半日潮）
    const hours = Array.from({ length: 145 }, (_, i) => (i * 10 / 60).toFixed(1));
    const tidalData = hours.map(h => {
      const t = parseFloat(h);
      // 模拟半日潮：两个主要潮汐周期叠加
      return (2.8 * Math.sin(2 * Math.PI * t / 12.42) +
              0.9 * Math.sin(2 * Math.PI * t / 6.21 + 0.5) +
              1.5).toFixed(2);
    });

    const option = {
      tooltip: {
        ...this.tooltipTheme,
        trigger: 'axis',
        formatter: params => {
          return `<div style="color:${this.themeColors.gold}">时刻: ${params[0].axisValue}h</div>
                  <div style="margin-top:4px">潮位: <strong>${params[0].value}m</strong></div>`;
        }
      },
      grid: {
        left: '6%', right: '4%', bottom: '10%', top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: hours,
        name: '时间（小时）',
        nameLocation: 'center',
        nameGap: 30,
        nameTextStyle: { color: this.themeColors.textMuted, fontSize: 12 },
        axisLabel: {
          color: this.themeColors.textMuted,
          fontSize: 11,
          interval: 35,
        },
        axisLine: { lineStyle: { color: this.themeColors.gridLine } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: '潮位（m）',
        nameTextStyle: { color: this.themeColors.textMuted, fontSize: 12 },
        axisLabel: { color: this.themeColors.textMuted, fontSize: 11 },
        splitLine: { lineStyle: { color: this.themeColors.gridLine } },
        axisLine: { show: false },
      },
      visualMap: {
        show: false,
        dimension: 1,
        min: -1.0,
        max: 5.5,
        inRange: {
          color: [this.themeColors.tide, this.themeColors.tideLight, this.themeColors.gold]
        }
      },
      series: [{
        name: '潮位',
        type: 'line',
        data: tidalData,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(90, 181, 176, 0.35)' },
            { offset: 0.5, color: 'rgba(90, 181, 176, 0.1)' },
            { offset: 1, color: 'rgba(90, 181, 176, 0.02)' }
          ])
        },
        markLine: {
          silent: true,
          data: [
            {
              yAxis: 4.3,
              lineStyle: { color: this.themeColors.copper, type: 'dashed', width: 1 },
              label: { formatter: '高潮位', color: this.themeColors.copper, fontSize: 11 }
            },
            {
              yAxis: -0.2,
              lineStyle: { color: this.themeColors.tide, type: 'dashed', width: 1 },
              label: { formatter: '低潮位', color: this.themeColors.tide, fontSize: 11 }
            }
          ]
        },
      }],
      animationDuration: 3000,
      animationEasing: 'cubicOut',
    };

    chart.setOption(option);
    return chart;
  },

  // ==================================
  // 图表6：古今桥梁对比条形图
  // ==================================
  comparisonBar(containerId) {
    const chart = echarts.init(document.getElementById(containerId));
    const data = BridgeData.comparison;

    const option = {
      tooltip: {
        ...this.tooltipTheme,
        formatter: params => {
          const d = data[params.dataIndex];
          return `<div style="color:${this.themeColors.gold};font-size:14px;margin-bottom:4px">${d.name}</div>
                  <div>国家: ${d.country} · 建成: ${d.year}年</div>
                  <div>长度: <strong>${d.length}m</strong></div>
                  <div>工法: ${d.method}</div>`;
        }
      },
      grid: {
        left: '3%', right: '8%', bottom: '5%', top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '桥梁长度（米）',
        nameTextStyle: { color: this.themeColors.textMuted, fontSize: 11 },
        axisLabel: { color: this.themeColors.textMuted, fontSize: 11 },
        splitLine: { lineStyle: { color: this.themeColors.gridLine } },
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLabel: {
          color: this.themeColors.text,
          fontSize: 12,
          fontFamily: "'Noto Serif SC', serif",
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [{
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.length,
          itemStyle: {
            color: d.country === '中国'
              ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: this.themeColors.gold },
                  { offset: 1, color: this.themeColors.goldLight }
                ])
              : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: this.themeColors.stone },
                  { offset: 1, color: this.themeColors.stoneLight }
                ]),
            borderRadius: [0, 4, 4, 0],
          }
        })),
        barWidth: '50%',
        label: {
          show: true,
          position: 'right',
          color: this.themeColors.textMuted,
          fontSize: 11,
          formatter: '{c}m'
        },
        animationDelay: idx => idx * 200,
      }],
      animationDuration: 1500,
      animationEasing: 'cubicOut',
    };

    chart.setOption(option);
    return chart;
  },

  // ==================================
  // 自适应所有图表
  // ==================================
  resizeAll(charts) {
    window.addEventListener('resize', () => {
      charts.forEach(chart => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
      });
    });
  }
};
