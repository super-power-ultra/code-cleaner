const beautify = require('js-beautify').html;
const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

function removeComment(objectData) {
  const { originDirName, resultDirName } = objectData;
  // 변환 파일이 저장될 디렉터리가 없으면 생성
  if (!fs.existsSync(resultDirName)) {
    fs.mkdir(resultDirName, () => {
      console.log(resultDirName);
    });
  }
  // origin 디렉터리 읽기
  fs.readdir(originDirName, (error, filenames) => {
    if (error) {
      console.log(error);
      return;
    }
    // 하위파일들에 대한 반복문
    filenames.forEach((filename) => {
      // 하위파일들의 형식을 확인

      fs.stat(`${originDirName}\\${filename}`, (error2, stats) => {
        if (error2) {
          console.log(error2);
        }
        // 파일일 경우 처리
        if (stats.isFile()) {
          // javascript 파일일 경우 처리
          if (path.extname(filename) === '.html') {
            fs.readFile(`${originDirName}\\${filename}`, 'utf-8', (error3, data) => {
              if (error3) {
                console.log(error3);
                return;
              }
              const temp3 = beautify(data, {
                indent_size: objectData.indent_size,
              });
              // replace한 데이터를 다시 덮어쓰기
              fs.writeFile(`${resultDirName}\\${filename}`, temp3, 'utf-8', () => {
                console.log(`${resultDirName}\\${filename}`);
              });
            });
          }
        }
        // 디렉터리일 경우 해당 디렉터리부터 다시 함수호출
        if (stats.isDirectory()) {
          removeComment({
            ...objectData,
            originDirName: `${originDirName}\\${filename}`,
            resultDirName: `${resultDirName}\\${filename}`,
          });
        }
      });
    });
  });
}

function checkBody(req, res, next) {
  console.log('checkBody middleware');

  const data = {};
  data.indent_size = 4;
  if (req.body.origin_dir_name !== '') {
    data.originDirName = req.body.origin_dir_name;
  } else {
    return res.json('checkBody err');
  }
  if (req.body.result_dir_name !== '') {
    data.resultDirName = req.body.result_dir_name;
  } else {
    return res.json('checkBody err');
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

  req.data = data;
  return next();
}

router.post('/', checkBody, (req, res) => {
  console.log({ data: req.data });
  removeComment(req.data);
  return res.json({
    message: 'done',
  });
});

module.exports = router;
