global.WritableStream = class {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    getWriter() {
        return {
            write: jest.fn(),
            close: jest.fn(),
            abort: jest.fn(),
        };
    }
};