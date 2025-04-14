async function checkAge(req, res, next) {

    if (!req.body.age) {
        return res.status(400).json({
            message: 'User must provide age'
        });
    }

    if (req.body.age < 18) {
        return res.status(403).json({
            message: 'User must be over 18',
        });
    }

    next();
}

module.exports = checkAge;