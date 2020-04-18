import { Response, NextFunction, Request } from 'express';

export const login = (req: Request, res: Response, next: NextFunction) => {
    if (req.query.token !== process.env.ADMIN_KEY) {
        return res.sendStatus(401);
    }

    next();
};
