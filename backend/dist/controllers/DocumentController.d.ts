/**
 * Document Controller
 * Handlers HTTP para documentos
 */
import { Request, Response } from 'express';
export declare class DocumentController {
    listDocuments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDocument: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createDocument: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateDocument: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteDocument: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPatientDocuments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTemplate: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=DocumentController.d.ts.map