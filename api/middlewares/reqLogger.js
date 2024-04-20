const logger = (req, res, next) => {
    const dateTime = new Date().toISOString();;
    const url = req.url;
    const method = req.method;

    console.log(`${dateTime} - ${method} - ${url}`);
    next();
};

module.exports = logger;