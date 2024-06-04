import type { Request, Response, NextFunction } from "express";

const Logger = (req: Request, res: Response, next: NextFunction): void => {
	const start = Date.now();
	res.on("finish", () => {
		const duration = Date.now() - start;
		const logMessage = `[${new Date().toISOString()}]: ${req.method} ${req.originalUrl} ${
			res.statusCode
		} ${duration}ms - ${req.ip} - ${req.headers["user-agent"]}`;
		console.log(logMessage);
	});
	next();
};

export default Logger;
