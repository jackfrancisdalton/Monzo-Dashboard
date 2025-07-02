# Problems I have in real life
- I can't easly see a chart of my spening broken down by label/payment target
- I can't see a side by side of respective weeks and months


# Overview of Monzo API

## Auth
Documentation requires oauth access token base authentication this will need to be supported in nestjs service

## Fetching 
- get accounts 
- get a balance 
- get pots 
- get transactions and get transaction

Note that: After a user has authenticated, your client can fetch all of their transactions, and after 5 minutes, it can only sync the last 90 days of transactions.
 If you need the user’s entire transaction history, you should consider fetching and storing it right after authentication.

Note: merchant list does not return a full merchent, only the merchant id, we'll likely want to store the merchant data in that case to avoid having to fetch every time 


## Data structure
### Transaction
{
    "transaction": {
        "amount": -510,
        "created": "2015-08-22T12:20:18Z",
        "currency": "GBP",
        "description": "THE DE BEAUVOIR DELI C LONDON        GBR",
        "id": "tx_00008zIcpb1TB4yeIFXMzx",
        "merchant": {
            "address": {
                "address": "98 Southgate Road",
                "city": "London",
                "country": "GB",
                "latitude": 51.54151,
                "longitude": -0.08482400000002599,
                "postcode": "N1 3JD",
                "region": "Greater London"
            },
            "created": "2015-08-22T12:20:18Z",
            "group_id": "grp_00008zIcpbBOaAr7TTP3sv",
            "id": "merch_00008zIcpbAKe8shBxXUtl",
            "logo": "https://pbs.twimg.com/profile_images/527043602623389696/68_SgUWJ.jpeg",
            "emoji": "🍞",
            "name": "The De Beauvoir Deli Co.",
            "category": "eating_out"
        },
        "metadata": {},
        "notes": "Salmon sandwich 🍞",
        "is_load": false,
        "settled": "2015-08-23T12:20:18Z"
    }
}


# Considerations
## Graphing
- use prometheus as the graphing tool as it's in built for this 
- use react app as the frontend with graphing ui


## Data syncing


# Use Cases

## Must 
- Ability to list aggregate spend per week setting a number of weeks going back (ie compare last 4 weeks of spending)
- 


## Should

## Could

## Wont


# UI Components

## Global range Setter
Data dog offers the ability to specify a data range that then applies to all cards
This element should allow filtering by:
- Category
- data range (this should have fast options like this week, month, year)


## Person Paid proportional area chart
displays a grid of all of the spending for the week bucketed by the target payer

## Category spent proportional area chart
dispalys a grid of all the spending for the week bucketed by the category

## Aggregated income outcome
displays 3 lines
- how much money came in this week
- how much money was spent this week
- the net of the two values
- if possible show the target spend as well


## Top list 
Displays the top elements that were spent on during a period

## Simple money in money out value for period
Displays two values red and green in and out
