export class MockFacadeSDK {
    private static instance: MockFacadeSDK;
    private constructor() {

    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new MockFacadeSDK();
        }
        return this.instance;
    }
}
