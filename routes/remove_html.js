const beautify = require('js-beautify').html;
const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

function removeComment(objectData) {
  const { originDirName, resultDirName } = objectData;

  try {
    // 변환 파일이 저장될 디렉터리가 없으면 생성
    if (!fs.existsSync(resultDirName)) {
      fs.mkdirSync(resultDirName);
    }

    // origin 디렉터리 읽기
    const filenames = fs.readdirSync(originDirName);

    // 하위파일들에 대한 반복문
    filenames.forEach((filename) => {
      const targetFile = `${originDirName}\\${filename}`;
      const targetOutputFile = `${resultDirName}\\${filename}`;

      // 하위파일들의 형식을 확인
      const stats = fs.statSync(targetFile);

      // 파일일 경우 처리
      if (stats.isFile() && path.extname(filename) === '.html') {
        // javascript 파일일 경우 처리
        const origin = fs.readFileSync(targetFile, 'utf-8');
        const beautified = beautify(origin, {
          indent_size: objectData.indent_size,
        });
          // replace한 데이터를 다시 덮어쓰기
        fs.writeFileSync(targetOutputFile, beautified, 'utf-8');
        console.log(`done: ${targetOutputFile}`);
        return;
      }

      // 디렉터리일 경우 해당 디렉터리부터 다시 함수호출
      if (stats.isDirectory()) {
        removeComment({
          ...objectData,
          originDirName: targetFile,
          resultDirName: targetOutputFile,
        });
      }
    });
  } catch (error) {
    console.log({ error });
    return false;
  }
  return true;
}

function checkBody(req, res, next) {
  console.log('checkBody middleware');

  const {
    indent_size: indentSize,
    origin_dir_name: originDirName,
    result_dir_name: resultDirName,
  } = req.body;

  if (!originDirName || !resultDirName) return res.json('checkBody err');

  req.data = {
    originDirName,
    resultDirName,
    indent_size: Number(indentSize) || 4,
  };
  return next();
}

router.post('/', checkBody, (req, res) => {
  console.log({ data: req.data });
  const isDone = removeComment(req.data);
  return res.json({
    message: isDone ? 'done' : 'fail',
  });
});

module.exports = router;
