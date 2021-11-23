import {WSResponse} from "src/data/Api";

export interface OrderBookEntries {
    orders: OrderBookEntry[];
}
export interface OrderBookEntry {
    price: number;
    size: number;
    total: number;
    barPercentage: number;
}

type BidMap = Map<number, {size: number; total: number; barPercentage: number}>;

export default class OrderBookProcessor {
    private _numberLevels = 0;
    private _initialBids: BidMap = new Map();
    private _initialAsks: BidMap = new Map();

    private _getHighestTotalValueInMap = (map: BidMap) => {
        const lastItem = Array.from(map.values()).pop();
        console.debug(lastItem);
        return lastItem ? lastItem.total : 0;
    };

    private get highestTotal(): number {
        const highestTotal = Math.max(
            this._getHighestTotalValueInMap(this._initialAsks),
            this._getHighestTotalValueInMap(this._initialBids)
        );
        console.debug(`Highest Total: ${highestTotal}`);

        return highestTotal;
    }

    public get asks(): Array<OrderBookEntry> {
        const tmpArray: Array<OrderBookEntry> = [];
        for (const [key, {size, total}] of this._initialAsks) {
            tmpArray.push({price: key, size, total, barPercentage: 0});
        }
        return tmpArray;
    }

    public get bids(): Array<OrderBookEntry> {
        const tmpArray: Array<OrderBookEntry> = [];
        for (const [key, {size, total}] of this._initialBids) {
            tmpArray.push({price: key, size, total, barPercentage: 0});
        }
        return tmpArray;
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
            this._updateEntries(asks, this._initialAsks);
            this._updateEntries(bids, this._initialBids);
        }
    };

    private _initializeEntries = (array: number[][]): BidMap => {
        const entryMap = new Map() as BidMap;
        for (const [price, size] of array) {
            entryMap.set(price, {size, total: 0, barPercentage: 0});
        }
        this._updateTotals(entryMap);
        return entryMap;
    };

    private _updateEntries = (arr: Array<number[]>, map: BidMap): void => {
        console.debug("Updating entries.");

        for (const [price, size] of arr) {
            if (size === 0) {
                map.delete(price);
                continue;
            }
            map.set(price, {
                size: size,
                total: 0,
                barPercentage: 0
            });
        }
        this._updateTotals(map);
    };

    private _updateTotals = (map: BidMap): void => {
        let accumulator = 0;
        for (const [key, {size}] of map) {
            accumulator += size;

            map.set(key, {size: size, total: accumulator, barPercentage: 0});
        }

        const highestTotal = this.highestTotal;

        for (const [key, value] of map) {
            const barPercentage = Math.round((value.total / highestTotal) * 100);
            console.debug(
                `Total: ${value.total}, highest total: ${highestTotal}, percentage: ${barPercentage}`
            );
            map.set(key, {...value, barPercentage});
        }
    };
}
