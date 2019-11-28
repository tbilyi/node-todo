const express = require('express');
const Admin = require('../models/admin');
const router = new express.Router();

router.post('/admin/login', async (req, res) => {

    try {
        const admin = await Admin.findByCredentials(req.body.name, req.body.password);

        const token = await admin.generateAuthToken();
        res.send({ token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/admin', async (req, res) => {
    const admin = new Admin(req.body);

    try {
        await admin.save();
        const token = await admin.generateAuthToken();
        res.status(201).send({ admin, token });
    } catch (e) {
        console.log(321)
        res.status(400).send(e);
    }
});

module.exports = router;