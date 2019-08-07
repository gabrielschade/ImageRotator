const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const rotateRouter = require('./routes/rotateRouter')();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', rotateRouter);
app.get('/',function(request,response) {
    response.sendFile( path.join(__dirname+'/application/views/index.html'));
});
app.use('/static', express.static('./domain'));
app.listen(port, () => {
    console.log(`running on port: ${port}`); 
});