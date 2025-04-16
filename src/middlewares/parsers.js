import _ from "lodash";

export function parseBody(fields) {
    return function (req, res, next) {
        const body = req.body;
        const missingFields = _.difference(fields, Object.keys(body));

        if (missingFields.length > 0) {
            return res.status(400).send(`Missing field(s): ${missingFields.join(", ")}.`);
        }

        req.bodyData = _.pick(body, fields);
        next();
    }
}