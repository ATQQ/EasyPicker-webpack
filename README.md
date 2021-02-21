# <h1 align="center">EasyPicker:轻取</h1>

<p align="center">
 	<a href="https://github.com/ATQQ/reportsPicker/releases">
		<img src="https://img.shields.io/badge/version-2.2.0-brightgreen.svg"
			 alt="Version">
	</a>
 	<a href="https://ep.sugarat.top">
		<img src="https://img.shields.io/badge/status-updating-success.svg"
			 alt="Status">
	</a>
</p>


## 项目简介
**[轻取](https://ep.sugarat.top)**,为方便在线文件收取而生。

## 项目背景
校园学习或者工作场景中会出现以下几个场景:
* 每次碰到上机课的时候,都会遇到收取实验报告。
* 需要收取每个人填写的各种电子表格。
* 需要通过QQ/微信等等收集各种截图
* 类似场景还有不少就不列举了。。。

通常的方式是,通过QQ/微信/邮箱等收取,弊端显而易见,太过于麻烦且不方便整理统计。还占用电脑/手机内存。为了解决这个问题,此项目应运而生。

>体验地址(PC端效果更佳喔):[https://ep.sugarat.top](https://ep.sugarat.top)<br>

## 本地运行
### 1. clone本仓库到bend
```sh
git clone https://github.com/ATQQ/EasyPicker-webpack.git
```
### 2. 安装依赖
```sh
# npm
npm install
# or

# yarn
yarn
```

### 3. 本地启动
tips：本地启动采用的服务端API是依赖的线上的测试环境
```sh
npm run dev
```

### 4. 相关指令
|   名称    | 作用           |
| :-------: | :------------- |
|    dev    | 本地启动服务   |
|   build   | 生产环境打包   |
|  deploy   | 生产环境部署   |
| deploydev | 测试环境打包   |
|   lint    | 代码格式化检查 |

## 相关地址
1. 正式环境：https://ep.sugarat.top
2. 测试环境：https://ep.dev.sugarat.top

注：两环境数据不互通,新功能会先在测试环境进行实验

## 技术栈
由于历史原因项目经历了2个大的阶段：
1. 前后端不分离-SSM/jQuery/amazeUI/sass
2. 前后端分离 -- **`目前`**
   * 后端：node/TypeScript
   * 前端：webpack/jQuery/amazeUI/TS 

## 相关仓库
1. ~~服务端(Java-已弃用)：https://github.com/ATQQ/EasyPicker~~

2. 客户端(web) ：https://github.com/ATQQ/EasyPicker-webpack
3. 服务端（Node.js-目前）：https://github.com/ATQQ/easypicker-server

## 相关资源
* [使用手册](https://sugar-js.gitbook.io/easypicker-manual/)
* [更新日志](https://github.com/ATQQ/EasyPicker/blob/server-maven/updateLog.md)
* [数据库相关](https://github.com/ATQQ/EasyPicker/blob/server-maven/src/main/java/database/V1.markdown)
* [接口文档](https://www.eolinker.com/#/share/index?shareCode=tz4ZKG)

## 其他链接
>Bug反馈:[https://github.com/ATQQ/reportsPicker/issues/2](https://github.com/ATQQ/reportsPicker/issues/2)<br>
>新功能建议:[https://github.com/ATQQ/reportsPicker/issues/1](https://github.com/ATQQ/reportsPicker/issues/1)<br>
问卷反馈:https://www.wenjuan.com/s/UZBZJvA040/

## 扫码反馈

![图片](http://img.cdn.sugarat.top/mdImg/MTU5Njg5NTE3MTk1Nw==596895171957)
## 欢迎体验分享,反馈Bug

![TIM图片20191015225526-20191015](http://img.cdn.sugarat.top/TIM图片20191015225526-20191015.gif)