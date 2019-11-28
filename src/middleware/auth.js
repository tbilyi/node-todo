const Admin = require('../models/admin')


const dev = async (req, res, next) => {

    const developer = req.query.developer;
    if (developer !== "taras") {
        res.send(resFormat("error", "Не передано имя разработчика"));
    }
   next();
};

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await Admin.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
}

const resFormat = (status, message) => {
    return {
        "status": status,
        "message": message
    };
};

module.exports = {
    dev,
    auth,
    resFormat
};
