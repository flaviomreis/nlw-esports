import express from 'express';
const app = express();
app.get('/ads', (request, response) => {
    response.json({
        status: 'ok',
    });
});
app.listen(3333);
