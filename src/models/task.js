const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Поле юзера является обязательным для заполнения');
            }
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Неверный email');
            }
        }
    },
    text: {
        type: String,
        trim: true,
        validate(value) {
            if (validator.isEmpty(value)) {
                throw new Error('Поле описание является обязательным для заполнения');
            }
        }
    },
    status: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});


taskSchema.methods.toJSON = function () {
    const task = this;
    const taskObject = task.toObject();

    delete taskObject.createdAt;
    delete taskObject.updatedAt;
    delete taskObject.__v;

    return taskObject;
}

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;