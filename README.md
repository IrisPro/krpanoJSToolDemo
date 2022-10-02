# krpano-tools-demo

## 单独为@krpano/js-tools 做的DEMO
原项目：https://github.com/IrisPro/KrpanoToolJS

单独拆开，因为DEMO会比较复杂，以后会有更多功能。

同时也为了测试在不同项目中，不同构建工具中，会不会有什么问题。


#### 待逐步完善！

## 使用

### 安装依赖
```shell
yarn
```

### 启动项目
```shell
npm run dev
```

### 其它备注

1. 如果使用import的方式去添加assets里面的静态文件，下载下来的文件都会被加上hash，这样会导致无法预览全景，所以，我使用压缩文件的方式，把所有文件压缩成一个zip，再合并krpanotools传递过来的blob，以及自身组装好的xml文件；
2. 在Mac中unix可执行文件其实是一个普通的**文稿**，通过使用jszip压缩后，再下载下来其实就变成一个普通的文稿，无法执行。所以我先把它压缩成一个zip文件，再去压缩。
