import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { MonzoAccount, MonzoBalance, MonzoTransaction } from '@repo/monzo-types';

// ==================== Configure Script CLI args
const argv = yargs(hideBin(process.argv))
    .option('accounts', { type: 'number', default: 1 })
    .option('transactions', { type: 'number', default: 60 })
    .parseSync();

const outDir = path.resolve(__dirname, '../mock-data');
fs.mkdirSync(outDir, { recursive: true });

console.log(`Starting generation script with ${argv.accounts} accounts and ${argv.transactions} transactions`);


// ==================== Generate Mocks
const accounts: MonzoAccount[] = Array.from({ length: argv.accounts }, () => ({
    id: 'acc_' + faker.string.uuid(),
    description: faker.helpers.arrayElement(['Personal Account', 'Joint Account', 'Savings']),
    created: faker.date.past().toISOString(),
}));

let runningBalance = faker.number.int({ min: 50000, max: 200000 }); // initial balance
const companies = Array.from({ length: 6 }, () => faker.company.name());

const transactionsCount = argv.transactions;
const daysRange = 300;
const today = new Date();
const interval = daysRange / transactionsCount;

const transactions: MonzoTransaction[] = Array.from({ length: argv.transactions }, (_, index) => {
    const amount = faker.number.int({ min: -10000, max: 10000 }); // Allow both debits (negative) and credits (positive)
    const created = new Date(today);
    created.setDate(created.getDate() - Math.round(index * interval));
    const settled = faker.date.soon({ days: 10, refDate: created });

    runningBalance += amount;

    const merchantAddress = {
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: 'GB',
        latitude: faker.location.latitude({ min: 51.50, max: 51.54 }),
        longitude: faker.location.longitude({ min: -0.14 , max: -0.08 }),
        postcode: faker.location.zipCode(),
        region: faker.location.county()
    };

    return {
        id: 'tx_' + faker.string.uuid(),
        amount,
        currency: 'GBP',
        created: created.toISOString(),
        description: (amount > 0 ? faker.helpers.arrayElement(['Income', 'Transfer', 'Refund']) : faker.commerce.productName()),
        category: faker.helpers.arrayElement(['eating_out', 'groceries', 'shopping']),
        merchant: {
            id: 'merch_' + faker.string.uuid(),
            name: faker.helpers.arrayElement(companies),
            category: faker.helpers.arrayElement(['eating_out', 'groceries', 'shopping']),
            logo: faker.image.urlLoremFlickr({ category: 'business' }),
            emoji: '🍔',
            address: merchantAddress
        },
        settled: settled.toISOString(),
    };
});


const balance: MonzoBalance = {
    balance: runningBalance,
    currency: 'GBP',
    spend_today: transactions
        .filter(t => new Date(t.created).toDateString() === new Date().toDateString())
        .reduce((acc, t) => acc + t.amount, 0),
};

// ==================== Write to JSON files
fs.writeFileSync(path.join(outDir, 'accounts.json'), JSON.stringify({ accounts }, null, 2));
fs.writeFileSync(path.join(outDir, 'transactions.json'), JSON.stringify({ transactions }, null, 2));
fs.writeFileSync(path.join(outDir, 'balance.json'), JSON.stringify(balance, null, 2));

console.log(`✅ Generated ${accounts.length} accounts and ${transactions.length} transactions`);
console.log(`💰 Final balance: £${(runningBalance / 100).toFixed(2)}`);
