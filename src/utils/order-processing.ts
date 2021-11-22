import {WSResponse} from "src/data/Api";

export interface OrderBookEntries {
    orders: OrderBookEntry[];
}
export interface OrderBookEntry {
    price: number;
    size: number;
    total: number;
}

type BidMap = Map<number, {size: number; total: number}>;
type AskMap = BidMap;

export default class OrderBookProcessor {
    private _numberLevels = 0;
    private _initialBids: BidMap = new Map();
    private _initialAsks: AskMap = new Map();

    public get bids(): BidMap {
        return this._initialBids;
    }

    public get asks(): AskMap {
        return this._initialAsks;
    }

    public processData = (data: WSResponse): void => {
        const {feed, asks, bids, numLevels, event} = data;

        // initial subscription
        if (event && event === "subscribed") {
            console.debug("Starting new subscription.");
            this._numberLevels = 0;
            this._initialAsks.clear();
            this._initialBids.clear();
        }

        // snapshot
        if (feed && feed.includes("snapshot")) {
            this._numberLevels = numLevels;
            this._initialAsks = this._initializeEntries(asks);
            this._initialBids = this._initializeEntries(bids);
        }

        // delta
        if (this._numberLevels > 0) {
            this.updateEntries(asks);
            this.updateEntries(bids);
        }
    };

    private _initializeEntries = (
        array: number[][]
    ): Map<number, {size: number; total: number}> => {
        const entryMap = new Map<number, {size: number; total: number}>();
        for (const [price, size] of array) {
            entryMap.set(price, {size, total: 0});
        }
        return entryMap;
    };

    updateEntries = (arr: Array<number[]>): void => {
        console.debug("Updating entries.");

        let index = 0;
        let sizeAccumulator = 0;
        for (const item of arr) {
            const [currentPrice, currentSize] = item;

            if (currentSize === 0) {
                this._initialAsks.delete(currentPrice);
                index++;
                continue;
            }

            this._initialAsks.set(currentPrice, {
                size: currentSize,
                total: index === 0 ? currentSize : sizeAccumulator
            });

            sizeAccumulator += currentSize;
            index++;
        }
    };
}
