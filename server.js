const express = require('express');
const path = require('path');
const app = express();


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});


const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running at: http://localhost: 3000`);
});
