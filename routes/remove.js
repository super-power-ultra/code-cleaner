/* eslint-disable camelcase */
const beautify = require('js-beautify').js;
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
      if (stats.isFile() && path.extname(filename) === '.js') {
        let pattern_line;

        // javascript 파일일 경우 처리
        const origin = fs.readFileSync(targetFile, 'utf-8');

        let pattern;
        let pattern_online;
        if (objectData.pattern_type === 'prefix') {
          /*
            /*WORAKAREA로 시작하고 주석으로 끝나는 해당 줄 제거
          */
          pattern = new RegExp(`\\/\\*${objectData.pattern}[^*]*\\*\\/\\n`, 'g');
          /*
            /*WORAKAREA로 시작하고 해당 줄에 다른 데이터가 있는경우 주석만 제거
          */
          pattern_online = new RegExp(`\\/\\*${objectData.pattern}[^*]*\\*\\/`, 'g');
        } else if (objectData.pattern_type === 'suffix') {
          pattern = new RegExp(`\\/\\*[^*]*${objectData.pattern}\\*\\/\\n`, 'g');
          pattern_online = new RegExp(`\\/\\*[^*]*${objectData.pattern}\\*\\/`, 'g');
        } else {
          pattern = new RegExp(`\\/\\*[^*]*${objectData.pattern}[^*]*\\*\\/\\n`, 'g');
          pattern_online = new RegExp(`\\/\\*[^*]*${objectData.pattern}[^*]*\\*\\/`, 'g');
        }
        if (objectData.pattern_line !== '' && objectData.pattern_line !== null) {
          /*
            // 패턴 주석 제거
          */
          pattern_line = new RegExp(objectData.pattern_type_line === 'prefix' ? `([^:]|^)\\/\\/${objectData.pattern_line}.*$` : `([^:]|^)\\/\\/.*${objectData.pattern_line}.*$`, 'gm');
        }

        const preBeautify = origin
          .replace(pattern, '')
          .replace(pattern_online, '')
          .replace(pattern_line, '');

        const beautified = beautify(preBeautify, {
          indent_size: objectData.indent_size,
          indent_with_tab: objectData.indent_with_tab,
          indent_level: objectData.indent_level,
          brace_style: objectData.brace_style,
          unindent_chained_methods: objectData.unindent_chained_methods,
          operator_position: objectData.operator_position,
          preserve_newlines: objectData.preserve_newlines,
          max_preserve_newlines: objectData.max_preserve_newlines,
        });
        // replace한 데이터를 다시 덮어쓰기
        fs.writeFileSync(targetOutputFile, beautified, 'utf-8');
        console.log(targetOutputFile);
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
    origin_dir_name: originDirName,
    result_dir_name: resultDirName,
  } = req.body;

  if (!originDirName || !resultDirName) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  const { body } = req;

  req.data = {
    originDirName,
    resultDirName,
    pattern: body.pattern || 'WORKAREA',
    pattern_line: body.pattern_line || '',
    pattern_type: body.pattern_type || 'prefix',
    pattern_type_line: body.pattern_type_line || 'prefix',
    indent_size: body.indent_size || 4,
    indent_with_tab: body.indent_with_tab || false,
    indent_level: body.indent_level || 0,
    brace_style: body.brace_style || 'collapse',
    unindent_chained_methods: body.unindent_chained_methods || false,
    operator_position: body.operator_position || 'before-newline',
    preserve_newlines: body.preserve_newlines || true,
    max_preserve_newlines: body.max_preserve_newlines || 10,
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
