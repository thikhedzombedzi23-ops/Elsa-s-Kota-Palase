# Elsa's Kota Palace – WhatsApp Order Store

I built this website for Elsa's Kota Palace. Customers pick what they want to eat, fill in their details, and the order goes straight to the shop on WhatsApp. There is no database and no server. It is just HTML, CSS and JavaScript.

**Live site:** _https://thikhedzombedzi23-ops.github.io/Elsa-s-Kota-Palase/_

## What it does

- Shows the menu with photos, prices, descriptions and category buttons
- Lets the customer add items to a cart and shows the total
- Lets the customer choose Collect or Deliver, and adds a delivery fee for each area
- Makes delivery free when the order is R200 or more
- Lets the customer choose Cash or EFT, and shows the bank details for EFT
- Sends the whole order as a ready-made WhatsApp message
- Shows an "Order sent" summary, so the customer can fix a mistake and send a CORRECTED order
- Works on phones, tablets and computers, in light and dark mode
- Clears itself on shared phones after 3 minutes of no activity
- Shows an emoji if a product has no photo
- Lets the shop owner update the menu from a Google Sheet

## What I used

- HTML
- CSS
- JavaScript (no frameworks or libraries)
- WhatsApp click-to-chat links (`wa.me`)
- Google Sheets (published as a CSV) for the menu

## How it works

1. The customer opens the website and taps **Add** on the items they want.
2. They choose **Collect** or **Deliver**. For delivery they pick their area and type their street address.
3. They type their name, add a note if they want (for example "no atchar"), and choose **Cash** or **EFT**.
4. They press **Send order on WhatsApp**. WhatsApp opens with the whole order already typed out.
5. The site shows an **Order sent** summary. If something is wrong, the customer can change the order and send it again. The new message is marked **CORRECTED**, so the shop knows to ignore the first one.

## Project files

```
.
├── index.html     # The page
├── style.css      # The design
├── script.js      # The shop settings, the menu and the logic
├── products.csv   # The menu for the Google Sheet
├── images/        # The product photos
└── README.md      # This file
```

## How to run it

1. Download or clone this repository.
2. Open the folder in VS Code.
3. Install the **Live Server** extension.
4. Right-click `index.html` and choose **Open with Live Server**.

## Settings

The settings I change most are at the top of `script.js`:

| Setting | What it does |
| --- | --- |
| `STORE_NAME` | The shop name shown on the page |
| `WHATSAPP_NUMBER` | The number that gets the orders (digits only, with country code, for example `27821234567`) |
| `CURRENCY` | The money symbol |
| `DELIVERY_AREAS` | The delivery areas and their fees |
| `FREE_DELIVERY_OVER` | The amount for free delivery (`0` turns it off) |
| `PAYMENT_OPTIONS` | The payment methods and the bank details |
| `IDLE_MINUTES` | Minutes of no activity before the page clears itself (`0` turns it off) |
| `SHEET_CSV_URL` | The link to the published Google Sheet |
| `PRODUCTS` | The menu that the site uses if the sheet can't load |

> **Note:** the bank details are written inside `script.js`, because the site shows them to customers who choose EFT. This means anyone who opens the live site's code can read them, even if the repository is private. If I don't want the account number to be visible, I can take it out of `script.js` and send the banking details to the customer on WhatsApp instead.

## Menu

| Category | Items |
| --- | --- |
| Kotas | Beginner (R20), G-Coast (R25), King size (R30), Delux (R45), Side platter (R55), Full House (R100), Family Super-Mega (R130) |
| Chips | Small (R20), Medium (R30), Large (R40) |
| Sandwiches | Small (R30), Medium (R50), Large (R65) |
| Wings | 5 pcs (R60), 10 pcs (R115) |
| Nuggets | 4 pcs (R12) |
| Extras | Cheese (R5), Polony slice (R3), Egg (R5), Vienna (R6), Russian (R12) |
| Drinks | Cooldrink 500ml (R16), Cappy juice 300ml (R18), 2L Original (R27), 2L Kingsley (R15) |

The real prices are in the Google Sheet and in the `PRODUCTS` list in `script.js`, so check there if this table looks out of date.

## Delivery

| Area | Fee |
| --- | --- |
| Tshamakhwitha | R20 |
| Mavuni matsuku | R15 |
| Thondoni | R20 |
| Fhasi ha bada | R20 |
| New stance | R15 |
| Out of Muswodi | R0 |

Collecting is free. Delivery is free when the items add up to R200 or more.

## Payment

- **Cash:** the customer pays when they collect or when the order is delivered.
- **EFT:** the bank details show on the page after the customer picks EFT. The customer must send proof of payment on WhatsApp.

## Product photos

The photos are in the `images/` folder. Each product has an image file name, and the file in the folder must have exactly the same name. I use lowercase names, because some web hosts treat `Photo.jpg` and `photo.jpg` as different files.

If a product has no photo, or the file name is wrong, nothing breaks. The site shows the emoji instead.

I use `.jpg` or `.webp` photos of about 800 × 600 pixels and under 200 KB, so the page loads quickly on phones. Tapping a photo on the site opens a bigger version.

## Updating the menu from Google Sheets

I connected the menu to a Google Sheet so the shop owner can change it without touching the code.

1. I made a Google Sheet from `products.csv`, with these headers in row 1: `id`, `name`, `price`, `category`, `emoji`, `description`, `available`, `image`.
2. I used **File > Share > Publish to web**, chose **Comma-separated values (.csv)**, and published it.
3. I pasted the link into `SHEET_CSV_URL` in `script.js`.
4. I shared the sheet with the shop owner as an **Editor**.

Now the shop owner can change prices and descriptions, add new products, and hide a sold-out item by typing `no` in the `available` column. The website updates a few minutes later.

Rules for editing the sheet:

- Don't change or delete the headers in row 1.
- Only type `yes` or `no` in the `available` column.
- A new product needs a photo in the `images/` folder with the same name as in the `image` column. Without one, the emoji shows.

Don't put the sheet's edit link in this README. Anyone who has it could change the menu.

If the sheet can't load, the site shows the saved `PRODUCTS` list and tells the customer.

## Privacy

The cart is only stored in the open browser tab and is never sent anywhere except in the WhatsApp message. After an order is sent, everything is cleared when the customer presses **Done – start a new order**, closes the tab, or leaves the page idle for 3 minutes.

## Putting it online

The site is only static files, so i hosted it for free on GitHub Pages.

**GitHub Pages:** go to the repository's **Settings > Pages**, choose the `main` branch and the root folder, and save. After a minute the link appears there.

## Author

_Thikhedzo Mbedzi._
