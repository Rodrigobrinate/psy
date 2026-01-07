/**
 * Financial Controller
 * Handlers HTTP para serviços e transações
 */
import { Request, Response } from 'express';
export declare class FinancialController {
    listServices: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getService: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createService: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateService: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteService: (req: Request, res: Response, next: import("express").NextFunction) => void;
    listTransactions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=FinancialController.d.ts.map