# fast-oss
fast-oss nodejs

## monorepo  
使用npm 7+版本的`workspaces`取代`lerna`

## 开发要求  
- npm 7+

## 开发前的准备  
首先请了解npm workspaces  

## 项目初始化安装
```shell
npm i
```

## 开发fast-oss-core
```shell
npm run dev -w=fast-oss-core
```

## 开发fast-oss-cli
```shell
npm run dev -w=fast-oss-cli
```

## 关联fast-oss-cli到全局
```shell
npm run link-cli
```

## 版本升级和发包
版本升级和发包遵循workspaces规范
