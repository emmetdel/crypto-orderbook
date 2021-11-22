import Api, {ProductID} from "./Api";

describe("API", () => {
    const callbackFn = jest.fn();
    const api = new Api(ProductID.Ethereum, callbackFn);

    describe("constructor", () => {
        it("constructor should assign correctly", () => {
            expect(api.productID).toEqual(ProductID.Ethereum);
            expect(api["_dataHandlerCallback"]).toEqual(callbackFn);
        });
    });

    // TODO: implement rest of tests
    // describe("#connect", () => {});

    // describe("#disconnect", () => {});
});
