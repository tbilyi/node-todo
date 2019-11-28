const express = require('express');
const Task = require('../models/task');
const { dev, resFormat, auth } = require('../middleware/auth');
const router = new express.Router();


// GET /tasks?page=number
// GET /tasks?sort_field=id|username|email|status
// GET /tasks?sort_direction=asc|desc
router.get('/tasks', dev, async (req, res) => {

    const sort = {};
    const sortField = req.query.sort_field;
    const sortDirection = req.query.sort_direction;
    const page = req.query.page;

    if ( sortField && sortDirection ) {
        sort[sortField] = sortDirection === 'desc' ? -1 : 1;
    }

    try {
        const countTasks = await Task.countDocuments();
        const tasks = await Task.find({})
            .skip(parseInt(page))
            .limit(3)
            .sort(sort);
        const message = {
            "tasks": [tasks],
            "total_task_count": countTasks
        };
        res.send(resFormat("ok", message));
    } catch (e) {
        res.status(500).send(resFormat("error", e.message));
    }
});

router.post('/task', async (req, res) => {
    const task = new Task(req.body);

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        const validFailText = "Task validation failed: ";
        let errorMessage = e.message;
        if (errorMessage.includes(validFailText)){
            errorMessage = errorMessage.replace(validFailText, "").split(",");
            err = {}
            errorMessage.map((item) =>{
                let i = item.trim().split(":");
                err[i[0]] = i[1].trim();
            });
            errorMessage = err;
        }
        res.status(500).send(resFormat("error", errorMessage));
    }
});

router.patch('/task/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['text', 'status'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(resFormat("error", e.message));
    }
});

router.delete('/task/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id });

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;