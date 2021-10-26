const express = require('express');
const path = require('path');

const app = express();

const staticDir = path.join(__dirname, './public');
const indexPage = path.join(staticDir, 'index.html');

app.use(express.static(staticDir));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/js/remove', require('./routes/remove'));
app.use('/js/remove_html', require('./routes/remove_html'));

app.get('/', (req, res) => {
  res.sendFile(indexPage);
});

app.listen(65001, () => {
  console.log('Server Running at http://localhost:65001');
});
