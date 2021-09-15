const beautify = require('js-beautify').js
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

var origin_dir_name;
var result_dir_name;

router.post('/', function(req, res) {
    checkBody(req, res).then(function(objectData) {
        res.redirect('/');
        removeComment(origin_dir_name, result_dir_name, objectData);
    }).catch(function() {
        res.redirect('/');
    });
});

function removeComment(origin_dir_name, result_dir_name, objectData) {
    //변환 파일이 저장될 디렉터리가 없으면 생성
    if (!fs.existsSync(result_dir_name)) {
        fs.mkdir(result_dir_name, function() {
            console.log(result_dir_name);
        })
    }
    //origin 디렉터리 읽기
    fs.readdir(origin_dir_name, function(error, filenames) {

        if (error) {
            console.log(error);
            return;
        }
        //하위파일들에 대한 반복문
        filenames.forEach(function(filename, index) {
            //하위파일들의 형식을 확인

            fs.stat(origin_dir_name + '\\' + filename, function(error, stats) {

                if (error) {
                    console.log(error);
                }
                //파일일 경우 처리
                if (stats.isFile()) {
                    //javascript 파일일 경우 처리
                    if (path.extname(filename) == '.js') {
                        fs.readFile(origin_dir_name + '\\' + filename, 'utf-8', function(error, data) {
                            if (error) {
                                console.log(error);
                                return;
                            }
                            var pattern;
                            var pattern_online;
                            if (objectData.pattern_type == 'prefix') {
                                /* 
                                    /*WORAKAREA로 시작하고 주석으로 끝나는 해당 줄 제거
                                */
                                pattern = new RegExp(`\\/\\*${objectData.pattern}[^*]*\\*\\/\\n`, "g");
                                /* 
                                    /*WORAKAREA로 시작하고 해당 줄에 다른 데이터가 있는경우 주석만 제거
                                */
                                pattern_online = new RegExp(`\\/\\*${objectData.pattern}[^*]*\\*\\/`, "g");
                            } else if (objectData.pattern_type == 'suffix') {
                                pattern = new RegExp(`\\/\\*[^*]*${objectData.pattern}\\*\\/\\n`, "g");
                                pattern_online = new RegExp(`\\/\\*[^*]*${objectData.pattern}\\*\\/`, "g");
                            } else {
                                pattern = new RegExp(`\\/\\*[^*]*${objectData.pattern}[^*]*\\*\\/\\n`, "g");
                                pattern_online = new RegExp(`\\/\\*[^*]*${objectData.pattern}[^*]*\\*\\/`, "g");
                            }
                            var temp = data.replace(pattern, "");
                            var temp2 = temp.replace(pattern_online, "");
                            if (objectData.pattern_line != '' && objectData.pattern_line != null) {
                                var pattern_line;
                                if (objectData.pattern_type_line == 'prefix') {
                                    /* 
                                        // 패턴 주석 제거
                                    */
                                    pattern_line = new RegExp(`([^:]|^)\\/\\/${objectData.pattern_line}.*$`, "gm");
                                } else {
                                    pattern_line = new RegExp(`([^:]|^)\\/\\/.*${objectData.pattern_line}.*$`, "gm");
                                }
                            }
                            var temp3 = temp2.replace(pattern_line, "");
                            var temp4 = beautify(temp3, {
                                indent_size: objectData.indent_size,
                                indent_with_tab: objectData.indent_with_tab,
                                indent_level: objectData.indent_level,
                                brace_style: objectData.brace_style,
                                unindent_chained_methods: objectData.unindent_chained_methods,
                                operator_position: objectData.operator_position,
                                preserve_newlines: objectData.preserve_newlines,
                                max_preserve_newlines: objectData.max_preserve_newlines
                            });
                            //replace한 데이터를 다시 덮어쓰기
                            fs.writeFile(result_dir_name + '\\' + filename, temp4, 'utf-8', function() {
                                console.log(result_dir_name + '\\' + filename);
                            });
                        });
                    }
                }
                //디렉터리일 경우 해당 디렉터리부터 다시 함수호출
                if (stats.isDirectory()) {
                    removeComment(origin_dir_name + '\\' + filename, result_dir_name + '\\' + filename, objectData);
                };
            });
        });
    });
}

function checkBody(req, res) {
    return new Promise(function(resolve, reject) {
        var data = new Object();
        data.pattern = 'WORKAREA';
        data.pattern_line = '';
        data.pattern_type = 'prefix';
        data.pattern_type_line = 'prefix';
        data.indent_size = 4;
        data.indent_with_tab = false;
        data.indent_level = 0;
        data.brace_style = 'collapse';
        data.unindent_chained_methods = false;
        data.operator_position = 'before-newline';
        data.preserve_newlines = true;
        data.max_preserve_newlines = 10;
        if (req.body.origin_dir_name != '') {
            origin_dir_name = req.body.origin_dir_name;
        } else {
            reject();
        }
        if (req.body.result_dir_name != '') {
            result_dir_name = req.body.result_dir_name;
        } else {
            reject();
        }
        if (req.body.pattern != '' && req.body.pattern != null) {
            data.pattern = req.body.pattern;
        }
        if (req.body.pattern_line != '' && req.body.pattern_line != null) {
            data.pattern_line = req.body.pattern_line;
        }
        if (req.body.pattern_type != '' && req.body.pattern_type != null) {
            data.pattern_type = req.body.pattern_type;
        }
        if (req.body.pattern_type_line != '' && req.body.pattern_type_line != null) {
            data.pattern_type_line = req.body.pattern_type_line;
        }
        if (req.body.indent_size != '' && req.body.indent_size != null) {
            data.indent_size = req.body.indent_size;
        }
        if (req.body.indent_with_tab != '' && req.body.indent_with_tab != null) {
            data.indent_with_tab = true;
        }
        if (req.body.indent_level != '' && req.body.indent_level != null) {
            data.indent_level = req.body.indent_level;
        }
        if (req.body.brace_style != '' && req.body.brace_style != null) {
            data.brace_style = req.body.brace_style;
        }
        if (req.body.unindent_chained_methods != '' && req.body.unindent_chained_methods != null) {
            data.unindent_chained_methods = true;
        }
        if (req.body.operator_position != '' && req.body.operator_position != null) {
            data.operator_position = req.body.operator_position;
        }
        if (req.body.preserve_newlines != '' && req.body.preserve_newlines != null) {
            data.preserve_newlines = false;
        }
        if (req.body.max_preserve_newlines != '' && req.body.max_preserve_newlines != null) {
            data.max_preserve_newlines = req.body.max_preserve_newlines;
        }
        resolve(data);
    });

}

module.exports = router;