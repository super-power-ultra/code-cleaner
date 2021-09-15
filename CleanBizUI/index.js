const express = require('express');
const fs = require('fs');
const app = express();
const remove = require('./js/remove.js');
const remove_html = require('./js/remove_html');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
// css 폴더에 있는 정적인 파일들 가져와서 url 매핑
app.use('/css', express.static('css'));
// /js/remove.js url에 remove 파일 매핑
app.use('/js/remove', remove);
app.use('/js/remove_html', remove_html);
// /경로에 index.html 파일을 매핑
app.get('/', function(req, res) {
    fs.readFile('index.html', 'utf-8', function(error, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(data);
    });
});
//65001포트로 local 서버 open
app.listen(65001, function() {
    console.log('Server Running at http://localhost:65001');
});