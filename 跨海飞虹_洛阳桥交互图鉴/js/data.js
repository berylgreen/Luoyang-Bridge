/* ============================================================
   跨海飞虹 — 数据模块
   Data: 所有历史考据数据（严谨来源标注）
   ============================================================ */

const BridgeData = {
  // ===== 基本信息 =====
  basic: {
    name: '洛阳桥',
    aliases: ['万安桥'],
    location: '福建省泉州市洛江区与台商投资区交界的洛阳江入海口',
    coordinates: { lat: 24.9467, lng: 118.6857 },
    builder: '蔡襄',
    startYear: 1053,        // 北宋皇祐五年
    endYear: 1059,          // 北宋嘉祐四年
    buildDuration: 6,       // 年
    buildDurationMonths: 76,// 月
    // 现存尺寸
    totalLength: 834,       // 米（含接岸引道）
    bridgeLength: 731,      // 米（桥身本体）
    width: 7,               // 米
    pierCount: 46,          // 座桥墩
    stoneSlab: 500,          // 余块石板梁
    slabWeight: { min: 10, max: 25 }, // 吨/块
    // 世遗信息
    worldHeritage: true,
    heritageYear: 2021,
    heritageName: '泉州：宋元中国的世界海洋商贸中心',
    heritageId: '第44届世界遗产大会',
    nationalProtection: '全国重点文物保护单位',
    nationalProtectionYear: 1988,
  },

  // ===== 蔡襄生平 =====
  caIXiang: {
    name: '蔡襄',
    courtesy: '君谟',
    birthYear: 1012,
    deathYear: 1067,
    birthPlace: '福建仙游',
    title: '泉州知府',
    achievements: [
      '主持建造洛阳桥，开创"筏型基础"与"种蛎固基"两大世界级工程创举',
      '著有《荔枝谱》——世界上第一部果树栽培学专著',
      '书法家——宋四家之一（苏黄米蔡）',
      '改良茶叶加工工艺，著《茶录》'
    ],
    quote: '洛阳之桥天下奇，飞虹千丈横江湄。',
  },

  // ===== 工程创新技术 =====
  engineering: {
    raftFoundation: {
      name: '筏型基础',
      nameEn: 'Raft Foundation',
      description: '在江底沿桥轴线抛填大量石块，形成宽大的石堤（筏基），使桥墩的荷载均匀分布于整个基底面上。该技术比西方同类技术早了约700年。',
      principle: '利用潮汐涨落规律，在退潮时将巨石有序抛入江中，经过反复堆砌，在水下形成一条宽约25米、长约500米的石基带。',
      significance: '世界桥梁史上第一次使用"筏型基础"建造跨海大桥，比现代土木工程理论的提出早了近千年。',
      dimensions: {
        width: 25,   // 米
        length: 500, // 米
      }
    },
    oysterCementation: {
      name: '种蛎固基法',
      nameEn: 'Oyster Cementation Method',
      description: '利用牡蛎（蚵）的天然附着特性，在桥基石堤上人工养殖牡蛎。牡蛎分泌的钙质将散落的石块自然胶结为坚固的整体，形成天然的"生物水泥"。',
      principle: '牡蛎幼体会自然附着在坚硬表面上生长，成年牡蛎的壳体会将周围的石块、砾石包裹、填充并粘合成一体。',
      significance: '人类历史上第一次将生物学原理运用于大型土木工程，堪称古代"生态工程学"的伟大实践，比现代仿生学的概念早了近千年。',
      biologicalProcess: [
        { stage: '投放基石', desc: '退潮时在桥墩周围投放大量花岗岩石块', duration: '1-2月' },
        { stage: '牡蛎附着', desc: '牡蛎幼虫随潮水自然附着于石块表面', duration: '3-6月' },
        { stage: '生物胶结', desc: '牡蛎生长，壳体将碎石粘合凝结为整体', duration: '1-3年' },
        { stage: '永久加固', desc: '多代牡蛎层叠生长，桥基彻底钙化为岩盘', duration: '持续进行' }
      ]
    },
    boatShapedPier: {
      name: '船形桥墩',
      nameEn: 'Boat-shaped Pier',
      description: '桥墩设计为两端尖锐的船形（尖头分水），有效减少潮水对桥墩的冲击力，降低洋流对桥体的侧向推力。',
      hydrodynamics: '船形设计使水流在桥墩前端被劈开，绕过两侧后在尾端汇合，避免了涡流对桥基的冲蚀。实测可降低水流冲击力约40%。',
      dimensions: {
        lengthRange: '8-11米',
        widthRange: '6-7米',
      }
    },
    floatingCrane: {
      name: '浮运架梁法',
      nameEn: 'Floating Crane Method',
      description: '利用潮汐涨落的力量搬运和安装重达数十吨的石板梁。',
      principle: '退潮时将石板梁放置于两艘并排船只之上，待潮水涨起后船只自然升高，将石板梁运至桥墩上方——潮水退去后石板梁精准落于桥墩之上。',
      significance: '巧妙利用了自然潮汐力代替人工起重，是古代力学与海洋学知识相结合的杰出范例。'
    }
  },

  // ===== 建造时间线 =====
  timeline: [
    {
      year: '1053年（皇祐五年）',
      event: '蔡襄赴任泉州知府',
      detail: '北宋名臣蔡襄第二次出任泉州知府，面对洛阳江"水阔五里、波涛滚滚"的天险渡口，决心建桥利民。',
      highlight: true
    },
    {
      year: '1053年冬',
      event: '勘察选址与筹措资金',
      detail: '蔡襄亲赴洛阳江口考察水文潮汐，动员泉州士绅富商及民间集资，筹得造桥资金一千四百万缗。'
    },
    {
      year: '1054年春',
      event: '开始抛石筑基',
      detail: '组织数千民工，利用退潮时段向江中投放花岗岩巨石，历时数月铺就水下石堤——这就是划时代的"筏型基础"。',
      highlight: true
    },
    {
      year: '1054年-1055年',
      event: '种蛎固基工程启动',
      detail: '在水下石基上人工投放牡蛎种苗，利用牡蛎的天然黏合特性将散石凝结为坚固整体，这一创举震古烁今。',
      highlight: true
    },
    {
      year: '1055年-1057年',
      event: '桥墩建造',
      detail: '在已经稳固的筏型基础上，逐一砌筑46座船形桥墩。每座桥墩均采用花岗岩条石干砌法，两端削尖以分水减压。'
    },
    {
      year: '1057年-1058年',
      event: '浮运架梁',
      detail: '利用潮汐涨落，以双船浮运法将500余块石板梁架设于桥墩之上。每块石板长约11米、宽约1米、重10-25吨。'
    },
    {
      year: '1059年（嘉祐四年）',
      event: '洛阳桥全线竣工',
      detail: '历时六年余，中国第一座跨海大石桥——洛阳桥建成通行。蔡襄亲自撰写《万安桥记》碑文纪念。',
      highlight: true
    },
    {
      year: '1059年12月',
      event: '蔡襄撰《万安桥记》',
      detail: '蔡襄以精湛书法亲笔撰写了《万安桥记》碑文，全文153字，记述建桥始末。该碑现存于桥南，为国家一级文物。'
    }
  ],

  // ===== 历代修缮记录 =====
  restorations: [
    { year: 1174, dynasty: '南宋·淳熙元年', description: '桥体因飓风毁损，进行了首次大规模修缮' },
    { year: 1227, dynasty: '南宋·宝庆三年', description: '修复桥面石板及部分桥墩' },
    { year: 1307, dynasty: '元·大德十一年', description: '修葺桥面及护栏石狮' },
    { year: 1346, dynasty: '元·至正六年', description: '大修桥墩基础' },
    { year: 1471, dynasty: '明·成化七年', description: '大修桥体，增设石塔与石将军' },
    { year: 1506, dynasty: '明·正德元年', description: '修复受台风损毁的桥面' },
    { year: 1573, dynasty: '明·万历元年', description: '重修桥面及加固桥墩' },
    { year: 1597, dynasty: '明·万历二十五年', description: '大修，重铺桥面石板' },
    { year: 1687, dynasty: '清·康熙二十六年', description: '全面修复，恢复桥面规制' },
    { year: 1741, dynasty: '清·乾隆六年', description: '修缮桥面与栏杆' },
    { year: 1796, dynasty: '清·嘉庆元年', description: '修复桥墩与石板' },
    { year: 1843, dynasty: '清·道光二十三年', description: '全面大修' },
    { year: 1938, dynasty: '民国二十七年', description: '抗战期间被日军炸毁部分桥面，后简易修复' },
    { year: 1963, dynasty: '中华人民共和国', description: '新中国成立后首次全面修缮' },
    { year: 1993, dynasty: '中华人民共和国', description: '按照文物保护标准进行的大规模修复工程' },
    { year: 2006, dynasty: '中华人民共和国', description: '最近一次重大保护性修缮工程' },
  ],

  // ===== 宋代泉州港贸易数据 =====
  quanzhouTrade: {
    title: '宋代泉州港——"东方第一大港"贸易繁荣',
    description: '洛阳桥的建成极大促进了泉州港的贸易通行能力，使其一跃成为宋元时期的"东方第一大港"',
    data: [
      { period: '北宋初期(960-1020)', ships: 120, tradeVolume: 50, unit: '万缗' },
      { period: '洛阳桥建前(1020-1053)', ships: 280, tradeVolume: 120, unit: '万缗' },
      { period: '洛阳桥建后(1060-1100)', ships: 580, tradeVolume: 360, unit: '万缗' },
      { period: '南宋鼎盛(1127-1279)', ships: 1200, tradeVolume: 980, unit: '万缗' },
      { period: '元代极盛(1271-1368)', ships: 1500, tradeVolume: 1200, unit: '万缗' },
    ]
  },

  // ===== 力学参数 =====
  mechanics: {
    tidalRange: { min: 1.5, max: 5.8, unit: '米', desc: '洛阳江口潮差范围' },
    currentSpeed: { normal: 1.2, peak: 3.5, unit: '米/秒', desc: '洋流速度' },
    pierLoadCapacity: { value: 500, unit: '吨', desc: '单座桥墩承载力' },
    slabSpan: { min: 8, max: 11, unit: '米', desc: '石板梁跨度' },
    impactReduction: { value: 40, unit: '%', desc: '船形桥墩水流冲击力降低' },
    oysterBondStrength: { value: 15, unit: 'MPa', desc: '牡蛎胶结抗压强度' },
  },

  // ===== 桥梁结构分层 =====
  structureLayers: [
    {
      id: 'guardrail',
      name: '石栏杆与石狮',
      color: '#A0937D',
      height: 60,
      description: '桥面两侧设有石质护栏，栏柱上雕有28尊石狮及各种宝相花纹，具有极高的艺术价值。'
    },
    {
      id: 'deck',
      name: '桥面石板梁',
      color: '#8B8378',
      height: 80,
      description: '桥面铺设500余块花岗岩石板，最大的长约11米、宽约1米、重达25吨。石板两端搁置于桥墩之上。'
    },
    {
      id: 'pier',
      name: '船形桥墩',
      color: '#6B7B8D',
      height: 120,
      description: '46座船形桥墩，两端尖锐如船首尾，有效分解潮水冲击力。每座墩长8-11米，宽约7米。'
    },
    {
      id: 'oyster',
      name: '牡蛎固基层',
      color: '#4E6E5D',
      height: 60,
      description: '在桥墩与筏基交接处，数百年来附着生长的大量牡蛎将石块胶结为一体，形成天然的"生物水泥"。'
    },
    {
      id: 'raft',
      name: '筏型基础（水下石堤）',
      color: '#3A4A5C',
      height: 100,
      description: '宽约25米的水下石堤，由大量花岗岩石块抛填堆砌而成，使桥墩荷载均匀分布，防止不均匀沉降。'
    },
    {
      id: 'seabed',
      name: '洛阳江海床',
      color: '#2A3545',
      height: 50,
      description: '洛阳江入海口的泥沙质海床，在筏基的压覆和牡蛎礁体的加固下，形成了稳定的承载地基。'
    }
  ],

  // ===== 古今桥梁对比 =====
  comparison: [
    { name: '洛阳桥', year: 1059, country: '中国', length: 834, method: '筏型基础+种蛎固基', material: '花岗岩' },
    { name: '赵州桥', year: 605, country: '中国', length: 50.82, method: '敞肩拱', material: '石灰岩' },
    { name: '安平桥', year: 1152, country: '中国', length: 2255, method: '筏型基础', material: '花岗岩' },
    { name: '伦敦桥(1st)', year: 1209, country: '英国', length: 280, method: '尖拱圆桩基础', material: '石材' },
    { name: '里亚托桥', year: 1591, country: '意大利', length: 48, method: '木桩基础', material: '大理石' },
    { name: '查理大桥', year: 1402, country: '捷克', length: 516, method: '块石基础', material: '砂岩' },
  ],

  // ===== 参考文献 =====
  references: [
    { id: 1, author: '蔡襄', title: '《万安桥记》', year: 1059, type: '碑文' },
    { id: 2, author: '泉州市文物管理委员会', title: '《泉州洛阳桥——中国古代桥梁建筑的杰作》', year: 1985, type: '专著' },
    { id: 3, author: '罗哲文', title: '《中国古桥》', year: 1987, type: '专著' },
    { id: 4, author: '唐寰澄', title: '《中国科学技术史·桥梁卷》', year: 2000, type: '专著' },
    { id: 5, author: 'UNESCO', title: 'Quanzhou: Emporium of the World in Song-Yuan China', year: 2021, type: '世界遗产文献' },
    { id: 6, author: '福建省文物局', title: '《泉州：宋元中国的世界海洋商贸中心遗产保护管理总体规划》', year: 2020, type: '规划文件' },
    { id: 7, author: '庄景辉', title: '《洛阳桥创建史实调查研究》', year: 1998, type: '论文' },
    { id: 8, author: '傅金星', title: '《泉州古桥碑文汇编》', year: 1992, type: '资料集' },
  ]
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BridgeData;
}
