# 物理仿真引擎深度调研报告（2024–2026）

> 调研日期：2026-08-16
> 方法：4 个并行研究子代理实时网络检索（WebSearch/WebFetch/真实浏览器），交叉验证后由主线程综合。
> 范围：物理仿真引擎技术全景 × 自动驾驶行业仿真 × 机器人行业仿真。
> 声明：厂商自测性能数字均标注口径；无法确证的数字标注「待核实」；知乎原文未能获取，详见第一节。

---

## 一、原文与作者

**调研起点**：知乎文章《物理仿真引擎介绍 - 罗清雨的文章》（`zhuanlan.zhihu.com/p/2071273390141446046`）。

**原文获取状态：失败**。Zhihu 对全部 6 种途径做了 IP 级风控：
- WebFetch 域名安全校验拦截
- curl 带浏览器 UA → 403 反爬 JS 挑战
- r.jina.ai 代理 → Cloudflare 人机验证
- 知乎 API（`api/v4/articles/{id}`）→ 403
- 真实 Chrome 打开 → 风控页 `code 40362`
- 全网搜索零索引；且 19 位文章 ID 格式与知乎常规 9 位 ID 不符，**不排除链接有误**

**作者身份查实**：罗清雨 = 轻舟智航（QCraft）北京**自动驾驶工程师**（qingyu@qcraft.ai）。代表作《聊聊Occupancy模型部署落地的一些心得》（CSDN 镜像：blog.csdn.net/CV_Autobot/article/details/143198774）。文章选题与职业背景吻合——物理引擎正是自动驾驶仿真的底层。

**同主题中文社区要点**（替代资料，非原文实摘）：
- 引擎对比共识：PhysX/Havok 商业优化好；Bullet 开源偏学术（Epic 因源码问题自研 Chaos）；学习推荐 Jolt（多线程友好）与 Newton Dynamics
- 技术路线之争：FEM/MPM（连续形式、有收敛性理论）vs PBD（离散形式、易实现可实时，但参数无物理对应）vs Discrete Shell
- 北大静园物理计算研究室专栏专注流体/刚体/弹性体前沿

---

## 二、物理引擎技术全景

### 2.1 开源刚体/多体动力学

| 引擎 | 2024–2026 状态 | 关键事实 |
|---|---|---|
| **MuJoCo**（DeepMind） | v3.0 内置 MJX（JAX/GPU 并行）；MuJoCo-Warp 宣称 70 倍加速 | 凸优化软接触 = **精度标杆**；研究界基准引擎；机器人论文默认平台 |
| **PhysX 5**（NVIDIA） | **2025-04 全量开源**（因 RTX 50 停 32 位 CUDA 而收尾，含此前闭源的 GPU CUDA kernel） | GPU-only 的 FEM 软体/PBD 布料/粒子流体并入；Omniverse 解算核心 |
| **Jolt** | MIT，确定性仿真、多核、双精度大世界 | 《地平线：西之绝境》《死亡搁浅 2》、OpenMW、Godot 扩展、WASM 移植 |
| **Box2D 3.0** | 2024-08 C11 重写，**图着色并行约束解算**（同色约束无锁并行且保持 Gauss-Seidel 收敛），性能约 2 倍 | 2D 王者；Angry Birds、Limbo、Unity 内置 |
| **Bullet/PyBullet** | 2024 起实质停更（Snyk 评级 Inactive） | 已出局；训练双足 47 小时 vs Genesis 3.2 小时 |
| **ODE / DART / Chrono** | 无明显 2024–2025 事件 | ODE 事实停滞；DART/Chrono 学术向（车辆/颗粒/DEM） |

### 2.2 可微物理 / GPU 仿真

- **Brax**（Google，NeurIPS 2021）：纯 JAX，四管线（MJX/广义坐标/PBD/冲量），物理引擎与 RL 优化器同置一 GPU 提速 100–1000 倍
- **NVIDIA Warp** v1.9（2024-08）：JIT CUDA kernel + 反向 AD，生态：Rewarped（ICLR 2025 可微多物理场）、DiffSim2Real（纯可微仿真训四足）、GeoWarp
- **Taichi/DiffTaichi**：单 GPU 10 亿粒子 MPM；ChainQueen 比 TF 实现快 188 倍；Genesis 构建于其上
- **Genesis**（2024-12，CMU 等 19 机构）：43M FPS（单 RTX 4090 Franka 场景，**采样率口径**）、"1 小时仿真 ≈ 10 年训练"、2025-07 融 1.05 亿美元。社区批评：本质是 MuJoCo+Taichi+GPU+光追的整合，"采样率≠保真度"；刚体可微仍为规划项
- **ManiSkill3**（RSS 2025）：SAPIEN/PhysX 内核 GPU 并行，RTX 4090 上 30,000+ FPS 渲染数据生成，128 环境仅 4.4GB 显存（vs Isaac Lab 14.1GB）
- **RFUniverse**（上海交大 MVIG，RSS 2023）：Unity 多物理场具身仿真（气固/流固/传热耦合）

### 2.3 软体 / 流体 / 布

- **XPBD** = 实时布料/软体事实标准（compliance 解耦刚度与迭代次数）；XPBI（SIGGRAPH Asia 2024）扩展到塑性/颗粒（雪、沙、橡皮泥）
- 性能：WebGPU 64 万布料节点 60fps；WebGL 仅 ~1 万节点
- **MPM**：Taichi-MPM（99 行冰雪奇缘）→ Genesis 原生 MPM → 可微隐式 MPM；雪/沙/流固耦合学术首选
- **SPH** 2025 趋势：混合神经架构（FluidFormer、PBF+反称核比传统 SPH 快 ~10 倍）
- **Vortex**（CM Labs，商业）：20 年工业级传感器级仿真（土方/缆索/ROV/HIL 训练）

### 2.4 游戏 / Web 领域

- **Rapier**（Rust→WASM）= Web 新事实标准：跨平台含 WASM 确定性、Bevy 官方插件
- cannon-es（~35KB gzip，易用但堆叠不稳定、维护停滞）；Ammo.js（经考验，门槛高）；Planck.js（2D 关节场景）
- **WebGPU compute** 2025 边界：3D 通用刚体仍靠 WASM（Rapier/Jolt/Havok）；GPU compute 突破集中在粒子/流体/XPBD 布料

### 2.5 商业引擎与 2025–2026 大趋势

- **Havok**（微软）：2023 美国销量前 20 游戏 12 款使用；2024-2025 调价向中小团队招手（5 万美元/产品档）
- **Chaos**（UE5）：Geometry Collections + Nanite（资产缩 95%）、Chaos Cache 确定性回放
- **GPU 更宽不更快**（DeepMind 官方口径）：单场景 64 核 CPU 2.7M steps/s > A100 950K；GPU 仅在数百上千并行场景胜出 → 工程选型：单场景低延迟靠 CPU，规模化训练/数据生成才上 GPU
- **生成式物理 × 世界模型**：PhyGenBench（ICML 2025）证明纯 T2V 模型普遍违反物理定律 → 2025 主流范式转向**神经-符号混合**（物理引擎出真值、世界模型做视觉多样性）
- **神经物理代理成熟**：GNS 一脉 2024–2026 在反演/参数扫描实用化（地震破裂 20-40 倍提速、3% 轨迹 <1% 误差、比 FNO/DeepONet 自回归误差低 82–99%）；严格守恒场景仍是物理引擎主场

### 2.6 判断矩阵

| 问题域 | 最强选择 | 备选 |
|---|---|---|
| 机器人 RL 大规模训练（状态级） | Genesis / MJX | Isaac Lab |
| 单场景低延迟高精度控制 | MuJoCo（CPU） | DART |
| 可微物理/逆设计 | NVIDIA Warp | Taichi |
| 视觉 RL / 具身数据生成 | ManiSkill3 | Isaac Sim |
| 3A 游戏刚体（自研） | Jolt | PhysX 5 |
| 2D 游戏物理 | Box2D 3.0 | Planck.js（web） |
| Web/WASM 游戏物理 | Rapier | Havok WASM |
| 电影级破坏 | Unreal Chaos | Blast |
| 布料/软体实时 | XPBD（GPU） | PhysX 5 PBD |
| 雪/沙/流固耦合学术 | MPM（Taichi/Genesis） | SPH |
| 工业 HIL 数字孪生 | Vortex（CM Labs） | Chrono |
| 神经代理/参数扫描反演 | GNS 类学习型代理 | FluidFormer |

---

## 三、自动驾驶行业仿真

### 3.1 平台与市场格局

- **CARLA**：0.10.0 迁 UE5.5（Nanite+Lumen）+ **物理引擎 PhysX → Chaos** + ROS2；15 万+ 开发者；NVIDIA NuRec 已集成
- **NVIDIA**：DRIVE Sim 事实重心转向 Omniverse 蓝图 + **Omniverse Cloud Sensor RTX**（物理级光线追踪传感器仿真，CES 2025）+ Cosmos + NuRec（SIGGRAPH 2025，RTX 光追 3DGS 重建）
- **Waymo**：Carcraft（2016 年 25 亿虚拟英里/年）→ Simulation City（2020 年累计 150 亿 vs 真实 2000 万）→ SurfelGAN → **World Model**（2025，Genie 3 基座，生成极端场景 + dashcam 视频转全传感器仿真）；定位 = Driver + Simulator + Critic 三件套
- **Applied Intuition**：2024.3 估值 60 亿美元 → 2025.6 Series F 6 亿美元、**估值 150 亿**；Neural Sim（真实驾驶日志 → 可交互虚拟世界）
- **欧洲工具链**：dSPACE ASM（Simulink 参数化动力学 + HIL）、IPG CarMaker、CarSim、VTD（VIRES/Hexagon）、rFpro（多路径光追渲染、1cm×1cm 路面模型、8/10 头部 OEM）
- **中国**：
  - **51WORLD**（2025-12 港交所上市，"物理AI第一股"）：端到端高阶智驾仿真市占 **53.5%**（沙利文口径）；2026-03 官宣 NuRec×SimOne、适配 Cosmos 3/Alpamayo
  - **腾讯 TAD Sim**：2024-08 开源，27 自由度动力学、云"日行百万公里"、MIL/SIL/HIL/VIL/DIL 全流程
  - **百度 Apollo**：仿真"日行千万公里"
  - **华为八爪鱼 Octopus**：千级并行仿真 + 盘古世界模型 + 2 万+ 场景库
  - **赛目科技**（2025-01 上市）：Sim Pro 获 ISO 26262 ASIL D（号称全球首款最高功能安全等级 ICV 仿真工具链）+ Safety Pro（SOTIF）
  - **沛岱 PilotD**：PlenRay 物理光学传感器仿真（干涉/多路径/大气衰减/鬼影，还原率逼近 95%）
  - **深信科创**：创始人杨子江，牵头 2 项 IEEE 标准

### 3.2 传感器仿真与神经重建

- 物理光学/光追路线：Sensor RTX、rFpro 多路径光追、沛岱 PlenRay、Ansys AVxcelerate
- 神经重建路线：Block-NeRF（Waymo）→ SurfelGAN → 3DGS 系（Street Gaussians/S3Gaussian）→ **Wayve PRISM-1**（4D 重建，CVPR 2024）→ **NVIDIA NuRec**（2025-08）

### 3.3 场景生成、标准与安全验证

- **ASAM OpenX 体系**：OpenDRIVE/OpenSCENARIO 2.0（Foretellix 牵头）/OpenLABEL/OSI；国产平台普遍宣称兼容
- **对抗式 fuzzing 活跃**（2024–2025）：AutoFuzz、AdvFuzz（12 小时多生成 198% 违规场景）、MARL-OT（多智能体 RL 在线 fuzzing，检出率 +136%）；共识问题：NPC 行为与真人差异大，影响向现实迁移
- **SOTIF（ISO 21448:2022）**：场景化测试验证 ADS 预期功能安全，覆盖整个 ODD；V 字流程 MIL→SIL→HIL→VIL→DIL

### 3.4 端到端与世界模型（2024–2026 最大变量）

| 玩家 | 世界模型 | 关键事实 |
|---|---|---|
| Wayve | GAIA-1 → **GAIA-2**（2025-03，~8B 参数） | 10.5 亿美元 Series C（软银领投）；2025-10 洽谈 20 亿融资、估值约 80 亿 |
| Tesla | **World Simulator**（2025-10，ICCV） | 纯神经网络数字孪生（非游戏引擎），8 摄像头 24fps 6 分钟连续视频，"一天蒸馏 500 年驾驶经验" |
| Waymo | World Model（Genie 3） | SceneDiffuser++（CVPR 2025，60 秒城市级生成仿真） |
| Waabi | Copilot4D（**ICLR 2024**，勘误：非 NeurIPS） | lidar 点云世界模型，Waabi World 闭环仿真器 |
| NVIDIA | Cosmos（CES 2025） | 18 万亿 token（含 2000 万小时驾驶/机器人视频）；Transfer-2（SIGGRAPH 2025） |
| 华为 | 盘古世界模型 | 视频+lidar 多模态生成，端到端并行仿真 |

### 3.5 Sim2Real 差距与法规

- **主流共识：纯仿真训练不可行**。Waymo 首席科学家 Drago Anguelov：仿真仍是"新兴领域"，许多虚拟世界"不够真实"；Cruise 刻意不统计仿真里程（强调场景质量）；"虚拟英里≠真实英里"
- 仿真价值：便宜至少一个数量级、可重复（根因分析）、可扩展（场景化 V&V）、放大稀有场景
- **中国法规（关键催化）**：
  - 2024-06 首批 9 家 L3 联合体试点；2025-12 首批两款 L3 车型获试点许可
  - **GB 44721-2026《智能网联汽车 自动驾驶系统安全要求》**（L3/L4 首部强制国标，**2027-07-01 实施**）：建立"企业保障能力检验 + 安全档案 + 确认性试验（场地/道路/**仿真**）"体系 → **仿真成为 L3 准入硬性前置**
- 美国：NHTSA AV STEP 拟议规则（2024-12，自愿框架 + 第三方评估 + 安全案例）

### 3.6 市场规模

- AD 仿真解决方案市场：13 亿美元（2024）→ 46.1 亿（2035，BIS Research，CAGR 12%）；宽口径 82.3 亿（2025）→ 410 亿（2030，CAGR 32%，含云服务，口径偏宽）
- 中国：沙利文预测智驾与具身智能仿真数据需求 **2030 年 1800 亿元**（经 51WORLD 披露）
- 融资：Applied Intuition 累计 >12 亿美元；Wayve 累计 10.5 亿+；Genesis AI 种子轮 1.05 亿；Foretellix 累计 1.35 亿

### 3.7 自动驾驶仿真与物理引擎的关系（结论）

两条路线并存：
1. **解析物理引擎路线**（控制/HIL/安全认证）：PhysX（CARLA 0.9.x、Omniverse）、Chaos（CARLA 0.10）、Bullet（MetaDrive）、自研参数化模型（CarSim/CarMaker/ASM/TAD Sim 27 自由度）。**MuJoCo 在 AD 仿真中几乎没有采用**——其生态在机器人/灵巧操作/MPC
2. **数据驱动/神经路线**（感知训练/场景生成）：世界模型 + 光线追踪渲染（Sensor RTX/PlenRay/rFpro）

规律：越靠近控制/HIL/认证越依赖解析物理；越靠近感知/端到端/长尾场景越依赖神经世界模型。2025 整合趋势 = 两者叠加（Foretellix/51Sim 打通"场景标准→物理渲染→神经世界模型"全栈）。

---

## 四、机器人行业仿真

### 4.1 平台格局

| 平台 | 2024–2025 动态 |
|---|---|
| Isaac Sim / Isaac Lab | **5.0 GA + Lab 2.2（2025）**；Lab 2.3 开发者预览含 Newton 集成；人形/四足运动 RL 事实标准 |
| Gazebo / gz-sim | Ionic（第 9 代，2024）发布；Intrinsic 时代重心仍是 ROS 生态闭环 |
| MuJoCo | v3.0 内置 MJX；MuJoCo Playground；研究基准 + 交叉验证引擎 |
| Webots | R2025a，维护活跃 |
| CoppeliaSim / PyBullet | 活跃度低/停更，边缘化 |
| Genesis | 2024-12 开源；定位"生成式数据引擎"而非确定性物理替代品 |
| ManiSkill3 | GPU 并行 + 渲染 30k FPS，显存效率标杆 |
| **Newton** | 2025-03 GTC 公布 → 2025-10 CoRL beta → **2026-03-17 发布 1.0**；DeepMind+Disney+NVIDIA → Linux Foundation 中立治理，Apache-2.0，基于 Warp+OpenUSD，MuJoCo 为其多求解器之一 |

### 4.2 RL + 仿真标准管线

- **Isaac Lab + rsl_rl/skrl**（PPO）= 当前人形/四足事实标准管线
- **MuJoCo + Brax/MJX**（Google 阵营）：JAX 原生、可微；局限：大量碰撞体（O(100)–O(1000)）场景退化、32 位精度梯度爆炸风险
- 吞吐基准（2025 期刊，A100/H100）：MuJoCo Playground 约 1500–3000 steps/s，Isaac Lab 约 600–1500（同配置，待核对原文）
- 人形公司实践：Figure（纯仿真 RL 拟人步态，2025）、1X（GTC 2026 披露 NVIDIA 技术栈）、宇树 unitree_rl_gym、智元 Genie Sim 3.0 自研平台、银河通用（仿真合成数据预训练 VLA + Isaac Sim 灵巧手数据集）、星动纪元 Humanoid-Gym、傅利叶（Isaac Gym）、Agility（Isaac Lab 训 Digit）
- **天工 Ultra**（北京人形机器人创新中心，2025-07 开源 Tien Kung-Lab，基于 Isaac Lab）：人形马拉松冠军（2 小时 40 分跑完半马）；"10 小时虚拟训练 ≈ 现实 100 天"；**Isaac Lab 训练 → MuJoCo Sim2Sim 交叉验证**的典型分工

### 4.3 Sim2Real 方法论

- 源头：Domain Randomization（OpenAI 2017）→ Dynamics Randomization（OpenAI 2018，Shadow Hand）
- **RMA**（ETH+UCB，Science Robotics 2021，ANYmal）：教师-学生特权学习 → 2024–2025 人形/四足事实标准
- ACT / Diffusion Policy：以真机遥操作为主；演进方向 = 仿真放大真机演示
- **MimicGen**（NVIDIA 2023，~10 倍数据放大）→ **DexMimicGen**（2024，2.1 万演示/60 任务）
- **2025 主线：遥操作 + 仿真混合**——GR00T Blueprint（少量遥操作种子 → 合成运动生成海量数据）；Isaac GR00T 集成进 HuggingFace LeRobot；RT-X（22 形态、100 万+ 真机轨迹）代表"真机规模化"互补路线

### 4.4 灵巧操作与 GR00T 时间线

- **接触建模深水区**：
  - MuJoCo：凸优化软接触，每步同时解全部接触，可配刚度/阻尼、肌腱模型 = 精度标杆；要求凸几何（V-HACD 分解）
  - PhysX（Isaac）：LCP 硬约束 + TGS/PGS 迭代；过约束配置解不一致是已知问题
  - Bullet：顺序冲量/惩罚接触，策略易学到求解器伪影
  - **跨引擎策略不迁移**（MuJoCo 高 SRCC 策略在 PyBullet 趋近于零）→ 选型即押注
- **GR00T 时间线**（已交叉验证）：N1（GTC 2025-03，2B，System1+System2）→ **N1.5（2025-05-19 COMPUTEX 台北，3B，非 8 月 SIGGRAPH；2025-06-11 开放下载）** → N1.6（CoRL 2025，集成 Cosmos Reason）；N1.5 操作成功率 38.3% vs N1 13.1% = 仿真合成数据 + 遥操作混合管线的 sim2real 证据链
- 灵巧抓取基准：DexGraspNet → DexGraspNet 2.0（ICML 2024）→ RealDex → DemoGrasp
- 世界模型：1X World Model（2024）、Cosmos（2025-01）；Newton 1.0（2026-03）标志"确定性物理 + 生成式世界模型"在 NVIDIA 体系内合流

### 4.5 数字孪生工厂

- NVIDIA **Mega 蓝图**（CES 2025-01）：仓库/工厂机器人车队级数字孪生，部署前大规模测试优化；KION×NVIDIA×Accenture 标杆案例
- 西门子：Tecnomatix + Simcenter × Omniverse（2024-03 打通，2025-06 深化）
- 国内：群核 SpatialTwin、埃斯顿×西门子、华航唯实；优必选/拓斯达/节卡/新松公开数字孪生案例**未检索到权威来源**（待核实）
- Azure Digital Twins 2024–2025 状态信息空白（待核实）

### 4.6 数据集与仿真占比

| 数据集 | 时间 | 规模 | 真机/仿真 |
|---|---|---|---|
| Open X-Embodiment / RT-X | CoRL 2023 | 22 形态、100 万+ episodes | 真机为主 |
| DROID | RSS 2024 | ~7.6 万 episodes / 564 小时 | 纯真机 |
| OpenVLA（7B） | 2024-06 | ~970K 轨迹 | 真机为主，仿真占比无公开数字（待核实） |
| AgiBot World（智元） | 2024-12-30 | 百万真机轨迹；Colosseo ~100 万/217 任务 | 真机 + 仿真扩增 |
| Robo-MIND（北京人形中心） | 2025-07 | 10.7 万条/479 任务 | 真机 |
| MimicGen/DexMimicGen/SIMPLER | 2023–2024 | — | 仿真生成/基准 |

**结论**：主流 VLA（OpenVLA、pi0）训练数据以真机为主；仿真数据定位 = 预训练/扩增/评估补充；"智元 Genie 数据集"作为独立开源数据集**未检索到可靠来源**。

### 4.7 机器人仿真与物理引擎的关系（结论）

- 轨迹：2015 MuJoCo 主导研究 → 2019–2021 Isaac Gym GPU 并行拐点 → 2024–2025 **Isaac Lab 成为人形运动 RL 事实标准**，MuJoCo 转型"交叉验证 + 接触密集场景"角色
- 一句话：**PhysX 靠 GPU 原生并行 + Isaac 生态锁定赢了"规模"（千级并行 RL 主战场）；MuJoCo 靠接触模型精度 + Apache 2.0 开放 + MJX 守住"精度与中立"；Bullet 实质出局；Newton 是三大阵营试图缝合两者的下一代标准引擎**。实际分工 = "Isaac Lab 训、MuJoCo 验、Newton 待接棒"；Genesis 价值定位更接近生成式数据引擎而非确定性物理替代品
- 速度数字不是选型依据：采样率≠保真度，接触密集任务（peg-in-hole 类）是放宽求解精度后最先退化的

---

## 五、贯穿三者的主线（核心启发）

1. **"规模"与"精度"不可兼得** —— GPU 批量并行拿到速度，代价是求解保真度。任何"百万倍加速"宣称都先问保真度（Genesis 争议、MJX 大碰撞退化、跨引擎策略不迁移的共同根源）。
2. **确定性是稀缺资产** —— Jolt 确定性仿真、Chaos Cache 确定性回放、Box2D 图着色保持 Gauss-Seidel 收敛，都在为"可复现"付费。**仿真行业的确定性 ≈ lazeword 学习轨迹的时空确定性**（事件溯源 + 种子洗牌），这是行业验证过的设计模式。
3. **法规把仿真变成刚需** —— 中国 GB 44721-2026（2027-07 实施）将仿真设为 L3 准入硬性前置；仿真从"可选工具"变"准入门槛"，这是 51WORLD/赛目股价逻辑。
4. **世界模型与物理引擎是合流而非替代** —— 2026 年叙事 = "物理引擎出真值，世界模型做视觉多样性"（GR00T/Cosmos/NuRec/Newton 都是这块拼图）。
5. **数据飞轮公式已成行业共识** —— 少量真机数据（遥操作/驾驶日志）→ 仿真放大 → 训练 → 真机回流 → 世界模型。AI 时代的仿真价值从"验证"扩展到"数据生产"。

---

## 六、对 lazeword 的借鉴

1. **游戏手感（近期可行）**：太空配对方块目前恒速下落。可加 2D 轻物理"juice"（Verlet 积分 + 圆形碰撞，自写约 100 行）让方块碰撞时轻微旋转/弹开。**不引入 Rapier**（35KB gzip 违背单文件零依赖原则）；Box2D 3.0 图着色并行在 Web 用不上，但"确定性+简单"是精髓。
2. **定位语言（免费收益）**：将学习轨迹的"事件溯源 + 确定性回放"用仿真行业语言表述（deterministic replay）——这是行业验证过的设计模式，可作为文档卖点。
3. **远期方向（不承诺）**：词库已含香港科学词汇；未来若做"科学词卡 + 物理小演示"（Taichi 99 行冰雪风格的 MPM 雪/沙），WebGPU 粒子完全够用——但这属于新项目量级，不是打磨项。

---

## 七、待核实清单

1. GR00T-Dexterity 精确规模与发布月份（高）
2. Azure Digital Twins 2024–2025 是否弃用/功能冻结（高）
3. 全球数字孪生市场规模具体数值/CAGR（高）
4. OpenVLA/pi0 训练数据中仿真占比官方口径（高）
5. Isaac Lab 1.0、Isaac Sim 5.0 GA 精确发布日期；"单 GPU 10,000+ 环境"官方出处（中）
6. DROID 小时数口径、DROID 2 是否存在；"智元 Genie 数据集"是否存在（中）
7. Figure/宇树/1X 是否逐字使用 Isaac Lab（中）；Tesla Optimus 仿真细节（公开信息缺失）
8. Waymo 真实路测里程口径（"接近 2 亿英里" vs 媒体历史 2000 万英里级，对应不同时点）
9. Waymo World Model 具体发布日期（来源有 2025-02 与 2025 下半年两种说法）
10. TAD Sim 底层引擎（官方仅称"腾讯游戏引擎"）
11. MuJoCo 3.0 具体新特性；PhysX 最新版本号 5.8；Box2D v3 官方 WASM 构建；ODE 当前维护状态

---

## 来源

**物理引擎**：[Genesis](https://github.com/Genesis-Embodied-AI/Genesis) · [MuJoCo MJX 讨论](https://github.com/google-deepmind/mujoco/discussions/2812) · [MuJoCo-Warp 70x](https://www.edge-ai-vision.com/2025/10/open-source-physics-engine-and-openusd-advance-robot-learning/) · [PhysX 全量开源](https://www.163.com/dy/article/JSK4NTFM05118EDB.html) · [JoltPhysics](https://github.com/jrouwe/JoltPhysics) · [Box2D 3.0](https://www.i-programmer.info/news/144-graphics-and-games/17419-box2d-3-released-easy-powerful-physics.html) · [Warp 1.9](https://github.com/NVIDIA/warp/releases/tag/v1.9.0) · [ManiSkill3 arXiv](http://arxiv.org/pdf/2410.00425) · [XPBI](https://arxiv.org/abs/2405.11694) · [Havok 技术演示](https://www.techspot.com/news/106438-havok-shares-first-physics-engine-tech-demo-10.html) · [Newton 开源（Linux Foundation）](https://www.linuxfoundation.org/press/linux-foundation-announces-contribution-of-newton-by-disney-research-google-deepmind-and-nvidia-to-accelerate-open-robot-learning) · [Newton 1.0](https://dataconomy.com/2026/03/17/nvidia-launches-newton-1-0-physics-engine-for-industrial-robot-training/) · [PhyGenBench](https://github.com/OpenGVLab/PhyGenBench) · [九引擎 RL 综述](https://web.archive.org/web/20240930180109/https://arxiv.org/html/2407.08590v1)

**自动驾驶**：[CARLA 0.10.0](https://github.com/carla-simulator/carla/releases/tag/0.10.0) · [Sensor RTX](https://blogs.nvidia.com/blog/omniverse-sensor-rtx-autonomous-machines/) · [Applied Intuition Series F](https://techcrunch.com/2025/06/17/applied-intuition-raises-600-million-as-it-pushes-further-into-defense/) · [Waymo Simulation City](https://on.theverge.com/2021/7/6/22565448/waymo-simulation-city-autonomous-vehicle-testing-virtual) · [Wayve PRISM-1](https://wayve.ai/thinking/prism-1/) · [Tesla 世界模拟器](https://www.huxiu.com/article/4797563.html) · [Copilot4D（ICLR 2024）](https://mlanthology.org/iclr/2024/zhang2024iclr-copilot4d/) · [TAD Sim](https://github.com/Tencent/TAD_Sim) · [51WORLD 强标催化](https://cn.investing.com/news/stock-market-news/article-3498363) · [赛目科技中报](http://www.zqrb.cn/gscy/gongsi/2025-08-28/A1756369486873.html) · [沛岱 Pre-A](https://www.36kr.com/p/1628868419073537) · [Foretellix Series C](https://www.foretellix.com/foretellix-raises-85-million-in-series-c-closing/) · [NHTSA AV STEP](https://www.nhtsa.gov/press-releases/nhtsa-proposes-national-program-vehicles-automated-driving-systems) · [L3/L4 强制国标](https://finance.eastmoney.com/news/1354,202608053832605591.html)

**机器人**：[Isaac Lab 论文](https://ar5iv.labs.arxiv.org/html/2511.04831) · [GR00T N1 论文](https://arxiv.org/abs/2503.14734) · [GR00T N1.5](https://research.nvidia.com/labs/gear/gr00t-n1_5/) · [Figure RL 步态](https://www.figure.ai/news/reinforcement-learning-walking) · [1X 仿真栈](https://www.1x.tech/discover/nvidia-gtc-2026) · [unitree_rl_gym](https://github.com/unitreerobotics/unitree_rl_gym) · [银河通用×Isaac](https://developer.nvidia.com/blog/spotlight-galbot-builds-a-large-scale-dexterous-hand-dataset-for-humanoid-robots-using-nvidia-isaac-sim/) · [天工 Tien Kung-Lab](http://bj.people.com.cn/n2/2025/0709/c14540-41285589.html) · [MimicGen](https://www.cs.utexas.edu/news/2025/researchers-reduce-human-effort-robot-training) · [GR00T×LeRobot](https://huggingface.co/blog/nvidia/nvidia-isaac-gr00t-in-lerobot) · [Mega 蓝图](https://blogs.nvidia.com/blog/mega-omniverse-blueprint/) · [AgiBot World](https://www.qbitai.com/2024/12/239066.html) · [OpenVLA](https://openvla.github.io/) · [Isaac Lab 求解器对比](https://isaac-sim.github.io/IsaacLab/release/3.0.0-beta2/source/overview/core-concepts/physical-backends/solver-comparison.html) · [三引擎接触模型对比](https://thecolony.cc/post/f02d5780-6ad6-4379-98b1-d470150d8d69)

**知乎同主题**：[三大物理引擎对比](https://www.zhihu.com/question/466091874/answer/1962144930) · [我们需要怎样的物理引擎](https://zhuanlan.zhihu.com/p/132681462) · [Genesis 讨论](https://www.zhihu.com/question/7298117178) · [罗清雨 Occupancy CSDN 镜像](https://blog.csdn.net/CV_Autobot/article/details/143198774)
