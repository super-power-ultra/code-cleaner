const express = require('express');
const path = require('path');

const app = express();

const staticDir = path.join(__dirname, './public');
const indexPage = path.join(staticDir, 'index.html');

app.use(express.static(staticDir));

app.use('/js/remove', require('./js/remove'));
app.use('/js/remove_html', require('./js/remove_html'));

app.get('/', function(req, res) {
    res.sendFile(indexPage)
});

app.listen(65001, function() {
    console.log('Server Running at http://localhost:65001');
});