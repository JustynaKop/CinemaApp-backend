const {validationResult} = require('express-validator');

const checkValidation = (req, res, next) => {
	try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ status: "validationFailed", errors: errors.array() });
        }
        next();
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", message: 'There was an unhadled error while processing the request.' }); 
    }
};

module.exports.checkValidation = checkValidation;