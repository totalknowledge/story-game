export function rollDice(times = 1, sides = 10) {
    let total = 0;
    for (let i = 0; i < times; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
}

export const d10 = (times = 1) => rollDice(times, 10);
export const d100 = (times = 1) => rollDice(times, 100);

export const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

export const pickRandom = (list: any[]) => list[randomInt(0, list.length - 1)];

export const shuffleInPlace = (entries: any[]): void => {
    entries.forEach((currentEntry, currentIndex) => {
        const swapIndex = randomInt(0, entries.length - 1);
        [entries[currentIndex], entries[swapIndex]] = [entries[swapIndex], currentEntry];
    });
};

export const log = (entity2Log: any) => {
    console.log(entity2Log);
}