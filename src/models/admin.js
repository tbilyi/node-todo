const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});


adminSchema.methods.generateAuthToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRET)

    admin.tokens = admin.tokens.concat({ token })
    await admin.save()

    return token
}

adminSchema.statics.findByCredentials = async (name, password) => {
    const admin = await Admin.findOne({ name })

    if (!admin) {
        throw new Error('Unable to login')
    }

    let isMatch = false;
    isMatch = await bcrypt.compare(password, admin.password)


    return admin
};


// Hash the plain text password before saving
adminSchema.pre('save', async function (next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }

    next()
})

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;