
var path = require('path')
,fs = require('fs');

var model = module.exports;

// 增加功能
model.addHero = function(heroData, callback) {
// 1. 要添加数据, 首先要先获取所有的数据, 调用一个函数(此时还不知道要什么参数)
getAllHeroData(function(err, data) {
    // 5.1 如果报错, 调用了callback(err, null), 也就是有err值
    if(err) {
        // 5.2 再返回错误信息, 所以又需要一个回调函数, 给该函数添加一个形参callback
        callback(err);
    }

    // 5.4 如果没有报错, 加添加进数据库, 所以再加一个保存方法, 将所有数据 以及 要保存的数据 传入
    saveHeroData(data, heroData, function(err){
        if(err) { // 5.10 如果报错, 返回错误信息
            callback(err);
        }
        //5.12 成功
        callback(null);
    });
})
}

// 因为获取全部数据这个方法不需要暴露出去, 不需要添加给model对象
// 为了发挥node的优势(高性能), 所以这里不使用同步
// 同步方式: 
// function getAllHeroData() {
//     try {
//         var data = fs.readdirSync(path.join(__dirname, 'hero.json'));
//     } catch (error) {
//         if(error) {
//             return error;
//         }
//     }
//     return data;
// }

// 2. 定义了一个getAllHeroData函数(此时没有决定参数)
function getAllHeroData(callback) {
fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf-8', function(err, data) { 
// 3. 因为是异步, 就不能使用return了, 因为, 异步函数会在同步之后执行, 当getAllHeroData函数时, 发现异步, 先向后执行, 
// 到头了之后函数结束, 永远也不会执行到里的异步函数, 也就永远拿不到数据
    if(err) {// 4. 如果报错了, 应该把错误信息返回, 但又用不了return, 所以使用回调函数, 给getAllHeroData一个形参 , 此时给函数定义了一个形参(回调函数), 所以给调用时也加入一个回调函数
        callback(err, null); //5. 报错时就没有data, 所以data返回null
    }

    callback(null, data); // 6. 否则就返回data
})
}

// 同样的, 不需要暴露出去
function saveHeroData(data, heroData, callback) { //接收所有数据 和 要保存的数据
// 5.5 转换成对象
var allHeroData = JSON.parse(data);
heroData.id = allHeroData.heros.length + 1; // 5.6 赋值id, 总长度+1
//5.7 存入
allHeroData.heros.push(heroData);

// 5.8 重新写入
fs.writeFile(path.join(path.parse(__dirname).dir, 'hero.json'), JSON.stringify(allHeroData, null, '  '), function(err) {
    if(err) { //5.9 如果报错, 返回错误信息
        callback(err);
    }

    //5.11 没有报错, 则成功
    callback(null);
})

}


//查询功能

model.showHeroInfo = function(id, callback) { // 根据id查询英雄, 该参数为字符串
fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf-8', function(err, data) {
    if(err) {
        callback(err); // 返回错误信息
    }

    // console.log(data);
    // console.log(+id);
    JSON.parse(data).heros.some(function(value) { // foreach 循环一定会对数组从头到尾进行遍历, 无法半途结束 , 较耗费性能
        // some循环对数组进行从头到尾的遍历, 当返回true时循环结束, 性能更好
        if(+id === value.id) {
            callback(null, value);
            return true;
        }
    })
});
}

// 编辑页面
model.showHeroEdit = function(id, callback) {
fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf8', function(err, data) {
    if(err) {
        callback(err);
    }
    JSON.parse(data).heros.some(function(value) { // 遍历heros数组
        if(+id === value.id) { // 如果id相同, 就说明已经找到所要的数据
            callback(null, value);
            return true;
        }
    })
})
}

//完成编辑
model.doHeroEdit = function(hero, callback) {
// 读取所有的数据
fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf8', function(err, data) {
    if(err) {
        return callback(new Error(err));
    }

    var heroObj = JSON.parse(data);

    hero.id = +hero.id; // 保存的id是字符串， 转为number
    // heroObj.heros.some(function(value, index) {
    //     if(hero.id === value.id) {
    heroObj.heros.splice(hero.id - 1, 1, hero);
    //     }
    // })

    //改完之后， 重新写会json文件中
    fs.writeFile(path.join(path.parse(__dirname).dir, 'hero.json'), JSON.stringify(heroObj, null, '  '), function(err) {
        if(err) {
            callback(err);
        }
        callback(null);
    });
})
}

//删除功能
model.doHeroDelete = function(id, callback) {
fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'utf-8', function(err, data) {
    if(err) {
        callback(err);
    }

    var heroObj = JSON.parse(data);
    console.log(+id);
    heroObj.heros.splice(+id - 1, 1); //数组下标从0开始
    
    heroObj.heros.forEach(function(value, index) {
        if(value.id > +id) {
            value.id -= 1;
        }
    });

    fs.writeFile(path.join(path.parse(__dirname).dir, 'hero.json'), JSON.stringify(heroObj, null, '  '), function(err) {
        if(err) {
            callback(err);
        }
        callback(null);
    })
})
}