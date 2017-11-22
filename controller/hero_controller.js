var fs = require('fs'),
    path = require('path'),
    formidable = require('formidable'),
    model = require('../model/hero_model.js'),
    Url = require('url');


var controller = module.exports;
//显示主页
controller.showMainPage = function (res) {
    //配置好之后, res就自带了一个渲染方法, 第一个参数是模板文本的文件名, 第二个参数是一个json对象
    //该文件名必须在views文件夹下, 如果是在views下的子文件夹中, 从子文件夹开始到目标文件
    fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf8', function(err, data) {
        if(err) {
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }))
        }
        res.render('heroViews/heroList', JSON.parse(data));
    })
}
//显示增加英雄页面
controller.showHeroAddPage = function (res) {
    res.render('heroViews/heroAdd');
}
//增加英雄操作
controller.doHeroAdd = function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(path.parse(__dirname).dir, '/public/images');
    form.keepExtensions = true;

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.end('Failed to load' + req.url);
        }
        var oldPath = path.join(files.icon.path);
        var newPath = path.join(form.uploadDir, files.icon.name);
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                res.end(JSON.stringify({
                    err_code: 500,
                    err_message: err.message
                }));
            }
            // console.log('数据保存成功');

            // 将新增的数据添加到json数据中
            fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf8', function (err, data) {
                if (err) {
                    res.end(JSON.stringify({
                        err_code: 500,
                        err_message: err.message
                    }));
                }

                var heroObj = {}; //新建一个对象, 保存提交的信息
                heroObj.name = fields.name;
                heroObj.gender = fields.gender;
                heroObj.icon = '/public/images/' + files.icon.name;

                // 调用model模块中的添加英雄方法
                model.addHero(heroObj, function (err) { // 写入保存, 只会出错或成功
                    if (err) { // 5.3, 如果报错
                        res.end(JSON.stringify({
                            err_code: 500,
                            err_message: err.message
                        }));
                    }
                    res.end(JSON.stringify({
                        success: true,
                        message: '保存成功'
                    }))
                });
            })

        })
    })
}

// 显示英雄信息
controller.showHeroInfo = function (req, res) {
    // 根据id查询英雄
    // console.log(Url.parse(req.url, true));
    model.showHeroInfo(Url.parse(req.url, true).query.id, function (err, hero) {
        if (err) {
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }));

        }
        console.log(hero);
        res.render('heroViews/heroInfo', hero);
    });


}

//显示编辑页面
controller.showHeroEdit = function (req, res) {
    model.showHeroEdit(Url.parse(req.url, true).query.id, function (err, hero) {
        if (err) {
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }))
        }
        res.render('heroViews/heroEdit', hero);
    })
}

//编辑功能
controller.doHeroEdit = function (req, res) {
    var form = new formidable.IncomingForm();

    form.uploadDir = path.join(path.parse(__dirname).dir, 'public/images'); //更改保存路径
    form.keepExtensions = true; //保留文件扩展名

    form.parse(req, function (err, fields, files) { //解析
        if (err) {
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }));
        }
        // console.log(fields);
        // console.log(files);

        var oldPath = path.join(files.icon.path);
        var newPath = path.join(form.uploadDir, files.icon.name);

        fs.rename(oldPath, newPath, function (err) { //重命名
            if (err) {
                res.end(JSON.stringify({
                    err_code: 500,
                    err_message: err.message
                }));
            }

            var hero = {}; //定义一个新对象，保存修改后的信息
            hero.id = fields.id;
            hero.name = fields.name;
            hero.gender = fields.gender;
            hero.icon = '/public/images/' + files.icon.name;
            console.log(hero);

            model.doHeroEdit(hero, function (err) {
                if (err) {
                    res.end(JSON.stringify({
                        err_code: 500,
                        err_message: err.message
                    }));
                }

                //如果成功， 重新渲染首页
                // res.render('heroList', 'hero');
                res.end(JSON.stringify({
                    success: true,
                    message: '保存成功'
                }))
            })
        })
    })
}

//删除功能
controller.doHeroDelete = function (req, res) {
    model.doHeroDelete(Url.parse(req.url, true).query.id, function (err) {
        if (err) {
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }))
        }
        fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf8', function(err, data) {
            if(err) {
                res.end(JSON.stringify({
                    err_code: 500,
                    err_message: err.message
                }))
            }
            res.render('heroViews/heroList', JSON.parse(data));
        })
    })
}

//显示静态资源
// controller.showStaticSrc = function (req, res) {
//     // 因为静态资源中可能有中文, 所以进行解码
//     fs.readFile(path.join(__dirname, decodeURI(req.url)), function (err, data) {
//         if (err) {
//             res.end('Failed to load' + url + 'Not Found');
//         }
//         res.end(data);
//     })
// }