const beautify = require('js-beautify').html;
const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

let originDirName;
let resultDirName;

function removeComment(originDirName2, resultDirName2, objectData) {
  // 변환 파일이 저장될 디렉터리가 없으면 생성
  if (!fs.existsSync(resultDirName2)) {
    fs.mkdir(resultDirName2, () => {
      console.log(resultDirName2);
    });
  }
  // origin 디렉터리 읽기
  fs.readdir(originDirName2, (error, filenames) => {
    if (error) {
      console.log(error);
      return;
    }
    // 하위파일들에 대한 반복문
    filenames.forEach((filename, index) => {
      // 하위파일들의 형식을 확인

      fs.stat(`${originDirName2}\\${filename}`, (error, stats) => {
        if (error) {
          console.log(error);
        }
        // 파일일 경우 처리
        if (stats.isFile()) {
          // javascript 파일일 경우 처리
          if (path.extname(filename) == '.html') {
            fs.readFile(`${originDirName2}\\${filename}`, 'utf-8', (error, data) => {
              if (error) {
                console.log(error);
                return;
              }
              const temp3 = beautify(data, {
                indent_size: objectData.indent_size,
              });
              // replace한 데이터를 다시 덮어쓰기
              fs.writeFile(`${resultDirName2}\\${filename}`, temp3, 'utf-8', () => {
                console.log(`${resultDirName2}\\${filename}`);
              });
            });
          }
        }
        // 디렉터리일 경우 해당 디렉터리부터 다시 함수호출
        if (stats.isDirectory()) {
          removeComment(`${originDirName2}\\${filename}`, `${resultDirName2}\\${filename}`, objectData);
        }
      });
    });
  });
}

function checkBody(req, res) {
  return new Promise((resolve, reject) => {
    const data = {};
    data.indent_size = 4;
    if (req.body.origin_dir_name !== '') {
      originDirName = req.body.origin_dir_name;
    } else {
      reject();
    }
    if (req.body.result_dir_name !== '') {
      resultDirName = req.body.result_dir_name;
    } else {
      reject();
    }
    if (req.body.pattern !== '' && req.body.pattern !== null) {
      data.pattern = req.body.pattern;
    }
    if (req.body.pattern_type !== '' && req.body.pattern_type !== null) {
      data.pattern_type = req.body.pattern_type;
    }
    if (req.body.indent_size !== '' && req.body.indent_size !== null) {
      data.indent_size = req.body.indent_size;
    }
    resolve(data);
  });
}

router.post('/', (req, res) => {
  checkBody(req, res).then((objectData) => {
    res.redirect('/');
    removeComment(originDirName, resultDirName, objectData);
  }).catch(() => {
    res.redirect('/');
  });
});

module.exports = router;
