const beautify = require('js-beautify').html;
const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

let origin_dir_name;
let result_dir_name;

router.post('/', (req, res) => {
  checkBody(req, res).then((objectData) => {
    res.redirect('/');
    removeComment(origin_dir_name, result_dir_name, objectData);
  }).catch(() => {
    res.redirect('/');
  });
});

function removeComment(origin_dir_name, result_dir_name, objectData) {
  // 변환 파일이 저장될 디렉터리가 없으면 생성
  if (!fs.existsSync(result_dir_name)) {
    fs.mkdir(result_dir_name, () => {
      console.log(result_dir_name);
    });
  }
  // origin 디렉터리 읽기
  fs.readdir(origin_dir_name, (error, filenames) => {
    if (error) {
      console.log(error);
      return;
    }
    // 하위파일들에 대한 반복문
    filenames.forEach((filename, index) => {
      // 하위파일들의 형식을 확인

      fs.stat(`${origin_dir_name}\\${filename}`, (error, stats) => {
        if (error) {
          console.log(error);
        }
        // 파일일 경우 처리
        if (stats.isFile()) {
          // javascript 파일일 경우 처리
          if (path.extname(filename) == '.html') {
            fs.readFile(`${origin_dir_name}\\${filename}`, 'utf-8', (error, data) => {
              if (error) {
                console.log(error);
                return;
              }
              const temp3 = beautify(data, {
                indent_size: objectData.indent_size,
              });
              // replace한 데이터를 다시 덮어쓰기
              fs.writeFile(`${result_dir_name}\\${filename}`, temp3, 'utf-8', () => {
                console.log(`${result_dir_name}\\${filename}`);
              });
            });
          }
        }
        // 디렉터리일 경우 해당 디렉터리부터 다시 함수호출
        if (stats.isDirectory()) {
          removeComment(`${origin_dir_name}\\${filename}`, `${result_dir_name}\\${filename}`, objectData);
        }
      });
    });
  });
}

function checkBody(req, res) {
  return new Promise((resolve, reject) => {
    const data = new Object();
    data.indent_size = 4;
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
    if (req.body.pattern_type != '' && req.body.pattern_type != null) {
      data.pattern_type = req.body.pattern_type;
    }
    if (req.body.indent_size != '' && req.body.indent_size != null) {
      data.indent_size = req.body.indent_size;
    }
    resolve(data);
  });
}

module.exports = router;
