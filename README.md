## 前端自动编译NodeJs+Grunt 自动化构建搭建

### NodeJs安装
[NodeJs安装地址](http://nodejs.org/)
输入node –v 如果有版本号出现，说明安装成功。

###grunt安装

    运行npm install –g grunt-cli; 
安装客户端

    运行npm install -g grunt;
安装Grunt
输入grunt -V 会显示grunt版本号
[Grunt中文参考手册](http://www.gruntjs.net/)

举例：
新建项目　gruntdemo
新建配置文件"package.json","Gruntfile.js"

### package.json　内容如下

```
{
  "name": "gruntdemo",
  "version": "1.0.0",
  "branch": "v1.0",
  "devDependencies": {
    "grunt-contrib-sass": "~0.9.2",//编译sass
    "grunt-contrib-watch":"~0.6.1",//代码监听
    "grunt-px-to-rem": "~0.4.0",//px转rem
    "load-grunt-tasks":"~3.4.0",//加载所有任务
    "grunt-contrib-concat":"~0.5.1",//合并文件
    "grunt-contrib-connect":"~0.11.2",//更新服务器文件
     "grunt-contrib-requirejs": "*",//执行requirejs合并
    "connect-livereload":"~0.5.4",//配合connect一起使用
    "serve-static":"~1.10.0",//用于创建静态文件服务器
    "serve-index":"~1.7.2 ",//用于启用目录浏览
    "grunt-contrib-cssmin": "~0.11.0",//css压缩
    "grunt-contrib-htmlmin": "~0.3.0",//html压缩
    "grunt-contrib-imagemin": "~0.9.4",//图片压缩
    "grunt-contrib-jshint": "~0.10.0",//js检测
    "grunt-contrib-uglify": "~0.7.0"//js压缩
    "connect-ssiinclude": "~0.0.2"//包含include文件
    "imagemin-mozjpeg":"~5.1.0"//压缩jpeg图片应用于grunt-contrib-imagemin里面
  }
}
```
### Gruntfile.js 配置内容如下

```
/**
 * Gruntfile.js配置项目文件内容如下
 */
module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    // LiveReload的默认端口号，你也可以改成你想要的端口号
    var lrPort = 3456;
    // 使用connect-livereload模块，生成一个与LiveReload脚本
    // <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
    var lrSnippet = require('connect-livereload')({
        port: lrPort
    });

    var ssInclude = require("connect-ssiinclude");
    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var lrMiddleware = function (connect, options) {
        // Same as in grunt-contrib-connect
        var middlewares = [];
        var directory = options.directory || options.base[options.base.length - 1];
        //if (!Array.isArray(options.base)) {
        //    options.base = [options.base];
        //}
//console.log("connect:"+connect);
        // Here we insert connect-include, use the same pattern to add other middleware
        //middlewares.push(ssInclude(directory));

        // Same as in grunt-contrib-connect
        //options.base.forEach(function(base) {
        //    middlewares.push(connect.static(base));
        //});

        //middlewares.push(connect.directory(directory));

        return [
            lrSnippet,
            ssInclude({root: directory}),
            // connect.directory(directory)
            //ssInclude(directory)
            // 静态文件服务器的路径
            serveStatic(options.base[0]),
            // 启用目录浏览(相当于IIS中的目录浏览)
            serveIndex(options.base[0])
        ];
    };
    var mozjpeg = require('imagemin-mozjpeg');
    var requireJsModules = [];
    grunt.file.expand({cwd: "src/js"}, "**/*.js").forEach(function (file) {
        if (file !== 'index1.js') {
            requireJsModules.push(file.replace(/\.js$/, ''));
        }
    });
// project configuration.
    grunt.initConfig({
        // Task configuration.
        //js压缩
        uglify: {
            js: {
                files: [{
                    expand: true,
                    cwd: 'src/js',
                    src: '{*,*/*}.js',
                    dest: 'src/dest'
                }]
            }
        },

        cssmin: {
            /**
             * 压缩css
             */
            my_target: {
                files: [
                    {
                        expand: true,
                        //相对路径
                        cwd: 'src/desc/',
                        src: '*.css',
                        dest: 'src/css'
                    }
                ]
            }
        },
        //图片优化

        imagemin: {                          // Task
            //static: {                          // Target
            //    options: {                       // Target options
            //        optimizationLevel: 3,
            //        svgoPlugins: [{ removeViewBox: false }],
            //        use: [mozjpeg()]
            //    },
            //    files: {                         // Dictionary of files
            //        'dist/img.png': 'src/img.png', // 'destination': 'source'
            //        'dist/img.jpg': 'src/img.jpg',
            //        'dist/img.gif': 'src/img.gif'
            //    }
            //},
            dynamic: {// Another target
                options: {                       // Target options
                    optimizationLevel: 3,
                    svgoPlugins: [{removeViewBox: false}],
                    use: [mozjpeg({quality: 80})]
                },
                files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'src/images/',                   // Src matches are relative to this path
                    src: "*.{gif,GIF,jpg,JPG,png,PNG}",   // Actual patterns to match
                    dest: 'src/copyimages/'                  // Destination path prefix
                }]
            }
        },
        //sass预编译
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "src/sass", //sass文件地址
                    src: ['*.scss'],//过滤的文件名
                    dest: "src/desc",//css文件名
                    ext: '.css'//扩展名
                }],
                options: {                       // Target options
                    style: 'expanded',//类型有四种
                    sourcemap: "none"//没有sourcemap地图
                }
            }
        },
        //px转rem
        px_to_rem: {
            dist: {
                options: {
                    base: 75,
                    fallback_existing_rem: false,
                    ignore: [],
                    map: false
                },
                files: {
                    'src/css/index.css': ['src/desc/index.css']
                    //'css/item.css': ['src/desc/item.css']

                }
            }
        },
        //javascript检查纠错
        jshint: {
            all: ['src/js/*', 'src/js/**/*.js']
        },
        //requirejs: {
        //    options: {
        //        baseUrl: "src/js",
        //        mainConfigFile: "src/js/page/index.js"
        //    },
        //    production: {
        //        options: {
        //            include: requireJsModules,
        //            out: "src/js/index1.js"
        //        }
        //    }
        //},
        requirejs: {
            compile: {
                options: {
                    baseUrl: "src/js",
                    mainConfigFile: 'src/js/config.js',
                    name: "./page/index",  //./是当前目录 
                    preserveLicenseComments: false,
                    optimize: "none",//不压缩代码
                    out: "src/js/index.js"
                }
            }
            //其他页面如需压缩则新增一个要压缩生产的js文件
            //,detail: {
            //            options: {
            //                baseUrl: "src/js",
            //                mainConfigFile: 'src/js/index.js',
            //                name: "index",
            //                preserveLicenseComments: false,
            //                out: "src/js/main-brand-built2.js"
            //            }
            //        }
        },
        //文件合并
        concat: {
            option: {
                separator: ';'
            },
            dist: {
                src: ['src/js/common/doT.js', 'src/js/common/swiper.js'],
                dest: 'src/dest/js/doTSwiper.js'
            }
        },
        //grunt-contrib-connect配置
        connect: {

            kxyewap: {
                options: {

                    // 服务器端口号
                    port: 1006,
                    // 服务器地址(可以使用主机名localhost，也能使用IP)
                    hostname: '*',
                    // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                    base: '',
                    directory: "",
                    open: {
                        target: 'http://127.0.0.1:1006/src',
                        appName: "chrome"
                    },
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware

                }
            }
            //,
            //dev: {
            //    options: {
            //        base: "web1",
            //        port: 2222,
            //        hostname: '*',
            //        livereload: 3030,
            //        open: {
            //            target: 'http://127.0.0.1:2222'
            //        }
            //    }
            //}
        },
        //监听
        watch: {
            sass: {tasks: ['sass'], files: ['src/sass/*.scss', 'src/sass/**/*.scss'], option: {livereload: lrPort}},
            rem: {tasks: ['px_to_rem'], files: 'src/desc/*.css', option: {livereload: lrPort}},
            client: {
                // 我们不需要配置额外的任务，watch任务已经内建LiveReload浏览器刷新的代码片段。
                options: {
                    livereload: lrPort
                },
                // '**' 表示包含所有的子目录
                // '*' 表示包含所有的文件
                files: ['src/*.html', "src/**/*.html", "src/css/*.css", "src/js/**/*.js", "src/js/*.js"]

            }
        }
    });

    // These plugins provide necessary tasks.


    grunt.registerTask('default', ['sass', 'px_to_rem', 'watch']);
    grunt.registerTask('rem', ['sass', 'px_to_rem']);
    grunt.registerTask("js", ['uglify:js']);
    grunt.registerTask("image", ['imagemin']);
    grunt.registerTask('concatfile', ['concat']);//合并
    grunt.registerTask('jshints', ['jshint']);//js代码检测，一般不用，好多都不正确
    grunt.registerTask('require', ['requirejs']);//requirejs合并
    grunt.registerTask('serve', ['sass', 'px_to_rem', 'connect', 'watch']);//监听
};
```

在配置文件路径下，执行 npm install  把相应的模块都加载进来，这样确保需要的module模块能够使用。

#### 说明
1、安装sass之前必须先安装 Ruby 和sass，安装成功后，在grunt里的sass命令才能执行成功。下面有安装的具体文档，这里就不再细细说明了。
2、requirejs 中的参数
baseUrl  指存放模块的根目录，这里是r4/js，因为cd到r4中了，只需设置为js。可选，如果没有设置将从r4中查找main.js。
name     模块的入口文件，这里设置成“main”，那么r.js会从baseUrl+main去查找。这里实际是r4/js/main.js。r.js会分析main.js，找出其所依赖的所有其它模块，然后合并压缩。
out        指合并压缩后输出的文件路径，这里直接是built.js，那么将输出到根目录r4下
requirejs 采用的是r.js来合并压缩的，详细参数可以根据r.js
参考文档内容

[connect-livereload](https://github.com/intesso/connect-livereload)
[ssi](https://github.com/kidwm/node-ssi)
[服务器刷新](http://www.bluesdream.com/blog/grunt-plugin-livereload-wysiwyg-editor.html)
[部署sass](http://www.w3cplus.com/preprocessor/nodejs-and-grunt-compile-sass-to-css.html)
[Ruby文件](http://rubyinstaller.org/)
[ruby安装](http://www.w3cplus.com/sassguide/install.html)
[LiveReload部署](https://github.com/zhonglimh/Grunt-LiveReload)
[imagemin安装](https://github.com/gruntjs/grunt-contrib-imagemin)
[r.js详细配置](http://segmentfault.com/a/1190000002403806)
