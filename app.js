// 导入模块
var express = require('express');
var controller = require('./controller/hero_controller.js');
var path = require('path');

//创建服务器
var app = express();
// 托管静态资源
//express.static() : 参数为要托管的文件目录的路径 , 会自动对请求的路径进行判断, 如果是就会返回相应的静态资源

//use() : 第一个参数代表虚拟目录, 即该参数指定是什么, 客户端浏览器的开头就要是什么
//例如真实路径为 /node_modules/jquery..., 当虚拟目录为 '/a'时, 客户端就要写成 '/a/jquery....'
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
//多个静态资源需要托管, 就写多次
app.use('/public', express.static(path.join(__dirname, 'public'))); //虚拟目录


//express提供模板引擎配置, 所以无需自行封装渲染的函数
//配置模板引擎  

//1. 使用模板引擎, 第一个参数: 要使用的模板的后缀名(可以任意, 不过为了方便, 通常写为html),  设置之后, express就只会识别该后缀名
app.engine('html', require('express-art-template'));
//2. 第一个参数表示使用的模板引擎(不同模板引擎可能方法有一些不一样) , 固定格式, 不能写错
// 第二个参数, 告诉express, 渲染什么后缀名的文件   必须和指定的后缀名一致
app.set('view engine', 'html');


// 设置路由
//显示主页
app.get('/', function(req, res) {
    controller.showMainPage(res);
});

//显示新增页
app.get('/heroAdd', function(req, res) {
    controller.showHeroAddPage(res);
});

//新增功能
app.post('/heroAdd', function(req, res) {
    controller.doHeroAdd(req, res);
});

//显示详情页
app.get('/heroInfo', function(req, res) {
    controller.showHeroInfo(req, res);
});

//显示编辑页
app.get('/heroEdit', function(req, res) {
    controller.showHeroEdit(req, res);
});


//编辑功能
app.post('/heroEdit', function(req, res) {
    controller.doHeroEdit(req, res);
});

//删除功能
app.get('/heroDelete', function(req, res) {
    controller.doHeroDelete(req, res);
});

app.listen(3000, function() {
    console.log('服务器开启成功!');
})