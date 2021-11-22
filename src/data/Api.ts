export enum ProductID {
    Bitcoin = "PI_XBTUSD",
    Ethereum = "PI_ETHUSD"
}

export interface WSResponse {
    feed: string;
    product_id: ProductID;
    event?: string;
    numLevels?: number;
    bids?: Array<number[]>;
    asks?: Array<number[]>;
}

export default class Api {
    private readonly _endpoint = "wss://www.cryptofacilities.com/ws/v1";
    private _ws?: WebSocket;

    constructor(
        public productID: ProductID,
        private _dataHandlerCallback: (data: WSResponse) => void
    ) {}

    public connect = async (): Promise<void> => {
        if (!this._isWSClosed()) {
            console.error("There is already a websocket connection open. Returning.");
            return;
        }
        this._ws = await this._connect();
    };

    public disconnect = async (): Promise<void> => {
        if (this._isWSClosed()) {
            console.error("Websocket connection is already closed or closing. Returning.");
            return;
        }
        await this._disconnect();
    };

    public switchProduct = (productID: ProductID): void => {
        if (this._isWSClosed()) {
            console.error("Websocket connection is closed, cannot switch product. Returning.");
            return;
        }
        this.disconnect().then(() => {
            this.productID = productID;
            this.connect();
        });
    };

    private _connect = (): Promise<WebSocket> => {
        return new Promise((resolve, reject) => {
            const wsConnnection = new WebSocket(this._endpoint);
            wsConnnection.onopen = () => {
                wsConnnection.send(
                    JSON.stringify({
                        event: "subscribe",
                        feed: "book_ui_1",
                        product_ids: [this.productID]
                    })
                );
                wsConnnection.addEventListener("message", (message: MessageEvent) =>
                    this._dataHandlerCallback(JSON.parse(message.data))
                );
                wsConnnection.addEventListener("error", this._errorHandler);
                resolve(wsConnnection);
            };
            wsConnnection.onerror = (err: Event) => reject(err);
        });
    };

    private _disconnect = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                if (this._ws.readyState === this._ws.CONNECTING) {
                    reject("Websocket is in a connecting state and cannot be closed. Returning.");
                }
                console.debug("Disconnecting Websocket connection.");
                this._ws.removeEventListener("message", () =>
                    this._dataHandlerCallback({} as WSResponse)
                );
                this._ws.send(
                    JSON.stringify({
                        event: "unsubscribe",
                        feed: "book_ui_1",
                        product_ids: [this.productID]
                    })
                );
                this._ws.close();
                this._ws.onclose = () => resolve();
            } catch (err: unknown) {
                reject(`Could not close Websocket connection, error: ${err}`);
            }
        });
    };

    private _errorHandler = (error: unknown) => {
        console.error(`Websocket Connection had an error: ${error}`);
        this._ws.close();
    };

    private _isWSClosed = (): boolean => {
        if (!this._ws) {
            return true;
        }
        return this._ws.readyState === this._ws.CLOSED || this._ws.readyState === this._ws.CLOSING;
    };
}
