module.exports = {
    src: 'src',
    dist: 'dist',
    dev: 'dev',
    file: 'hello',
    port: 3000,
    rem: {
        root_value: 20, // 基准值 html{ font-zise: 20px; }
        prop_white_list: [], // 对所有 px 值生效
        minPixelValue: 2 // 忽略 1px 值
    },
    autoprefix: {
        browsers: ['last 5 versions']
    },
    htmlRem: {
        rootValue: 20,
        minPixelValue: 2
    },
    html: {
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true,//压缩HTML
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        minifyJS: true, // 压缩页面JS
        minifyCSS: true, // 压缩页面CSS
    },
    isProd: true,
    ejs: { page: 'kuaigan' },
}