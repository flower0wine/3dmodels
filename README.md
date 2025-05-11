# 3D模型展示网站

这是一个使用Next.js和Three.js构建的3D模型展示网站，支持展示多种不同格式的3D模型。

## 功能特点

- 支持多种3D模型格式（GLB, GLTF, OBJ, FBX, STL）
- 瀑布流布局展示模型
- 点击模型查看详情
- 3D模型交互式查看
- 访问计数统计

## 技术栈

- Next.js 15
- React 19
- Three.js / React Three Fiber / Drei
- Firebase (Firestore)
- Tailwind CSS
- DaisyUI
- Masonic (瀑布流布局)

## 安装与运行

1. 克隆仓库
```bash
git clone https://github.com/yourusername/3dshow.git
cd 3dshow
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
创建`.env.local`文件，添加Firebase配置：
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. 运行开发服务器
```bash
pnpm dev
```

5. 构建生产版本
```bash
pnpm build
pnpm start
```

## 项目结构

```
src/
├── app/                  # Next.js App Router
│   ├── components/       # React组件
│   │   ├── Header.tsx    # 页眉组件
│   │   ├── ModelCard.tsx # 模型卡片组件
│   │   ├── ModelDetail.tsx # 模型详情组件
│   │   └── ModelViewer.tsx # 3D模型查看器
│   ├── hooks/            # React Hooks
│   │   └── useVisitCount.ts # 访问计数Hook
│   ├── lib/              # 库和服务
│   │   └── firebase.ts   # Firebase配置和服务
│   ├── types/            # TypeScript类型定义
│   │   └── index.ts      # 模型类型定义
│   ├── utils/            # 工具函数
│   │   └── mockData.ts   # 模拟数据
│   ├── layout.tsx        # 布局组件
│   ├── page.tsx          # 首页
│   └── globals.css       # 全局样式
├── public/               # 静态资源
└── ...
```

## 添加自己的3D模型

要添加自己的3D模型，请编辑`src/app/utils/mockData.ts`文件，按照现有格式添加新的模型数据。

## 许可证

MIT
