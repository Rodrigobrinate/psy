"use strict";
/**
 * Test Controller
 * Orquestra requisições relacionadas a testes psicológicos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const TestService_1 = require("../services/TestService");
const schemas_1 = require("../lib/schemas");
const errorHandler_1 = require("../middlewares/errorHandler");
const testService = new TestService_1.TestService();
class TestController {
    constructor() {
        this.list = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const category = req.query.category;
            const tests = await testService.listTests(category);
            res.json({
                data: tests,
                count: tests.length,
            });
        });
        this.get = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const test = await testService.getTestWithQuestions(id);
            res.json({ data: test });
        });
        this.submitResponse = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const psychologistId = req.psychologist.psychologistId;
            const validatedData = schemas_1.submitTestResponseSchema.parse(req.body);
            const result = await testService.submitTestResponse(validatedData, psychologistId);
            res.status(201).json({
                message: 'Teste enviado e processado com sucesso',
                data: result,
            });
        });
        this.getPatientHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { patientId } = req.params;
            const psychologistId = req.psychologist.psychologistId;
            const history = await testService.getPatientTestHistory(patientId, psychologistId);
            res.json({
                data: history,
                count: history.length,
            });
        });
    }
}
exports.TestController = TestController;
//# sourceMappingURL=TestController.js.map