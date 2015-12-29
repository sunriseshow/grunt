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
    var lrMiddleware = function(connect, options) {
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
            ssInclude({root:directory}),
           // connect.directory(directory)
            //ssInclude(directory)
            // 静态文件服务器的路径
            serveStatic(options.base[0]),
            // 启用目录浏览(相当于IIS中的目录浏览)
            serveIndex(options.base[0])
        ];
    };
    var mozjpeg = require('imagemin-mozjpeg');
// project configuration.
    grunt.initConfig({
        // Task configuration.
        //js压缩
        uglify: {
            js: {
                files: [{
                    expand: true,
                    cwd: 'js',
                    src: '{*,*/*}.js',
                    dest: 'dest'
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
                        cwd: 'desc/',
                        src: '*.css',
                        dest: 'css/css'
                    }
                ]
            }
        },
        //图片优化
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        //相对路径
                        cwd: 'style/image',
                        src: ['*.{gif,jpg,png}'],
                        dest: 'dest/img'

                    }
                ]
            }
        },
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
                    svgoPlugins: [{ removeViewBox: false }],
                    use: [mozjpeg({quality: 80})]
                },
                files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'images/',                   // Src matches are relative to this path
                    src: "*.{gif,GIF,jpg,JPG,png,PNG}",   // Actual patterns to match
                    dest: 'copyimages/'                  // Destination path prefix
                }]
            }
        },
        //sass预编译
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "sass", //sass文件地址
                    src: ['*.scss'],//过滤的文件名
                    dest: "css",//css文件名
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
                    'css/test.css': ['css/test.css'],
                    'css/item.css': ['css/item.css']

                }
            }
        },
        //javascript检查纠错
        jshint: {
            all: ['js/*','js/**/*.js']
        },
        //文件合并
        concat: {
            option: {
                separator: ';'
            },
            dist: {
                src: ['js/common/doT.js','js/common/swiper.js'],
                dest: 'dest/js/doTSwiper.js'
            }
        },
        //grunt-contrib-connect配置
        connect: {

                livereload: {
                    options: {

                        // 服务器端口号
                            port: 8000,
                            // 服务器地址(可以使用主机名localhost，也能使用IP)
                            hostname: '*',
                            // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                            base: '',
                            directory:"",
                            open: {
                                target: 'http://127.0.0.1:8000',
                                appName:"chrome"
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
            sass: {tasks: ['sass'], files: 'sass/*.scss', option: { livereload: lrPort }},
            rem: {tasks: ['px_to_rem'], files: 'css/*.css', option: { livereload: lrPort }},
            client: {
                // 我们不需要配置额外的任务，watch任务已经内建LiveReload浏览器刷新的代码片段。
                options: {
                    livereload: lrPort
                },
                // '**' 表示包含所有的子目录
                // '*' 表示包含所有的文件
                files: ['*',"html/*"]

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
    grunt.registerTask('demo', ['connect', 'watch']);//监听
};
