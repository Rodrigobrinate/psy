/**
 * Test Controller
 * Orquestra requisições relacionadas a testes psicológicos
 */
import { Request, Response } from 'express';
export declare class TestController {
    list: (req: Request, res: Response, next: import("express").NextFunction) => void;
    get: (req: Request, res: Response, next: import("express").NextFunction) => void;
    submitResponse: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPatientHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=TestController.d.ts.map