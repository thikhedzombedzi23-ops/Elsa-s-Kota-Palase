WHATSAPP ORDER STORE
====================
Files: index.html (page), style.css (design), script.js (settings + logic), products.csv (sample sheet)

RUN IT
  Open the folder in VS Code, right-click index.html > Open with Live Server.

SET UP (top of script.js)
  WHATSAPP_NUMBER   your number, digits only, with country code (27821234567)
  STORE_NAME, CURRENCY
  DELIVERY_AREAS    add/remove areas and fees; FREE_DELIVERY_OVER = free delivery threshold (0 = off)
  PAYMENT_OPTIONS   delete options you don't offer; put your bank details in the EFT info,
                    and your Yoco/PayFast/SnapScan link in the "Pay online" url

EDIT PRODUCTS FROM A GOOGLE SHEET (no code)
  1. Go to sheets.google.com > Blank sheet > File > Import > Upload products.csv > Replace spreadsheet.
  2. Keep these headers in row 1: name, price, category, emoji, description, available
     (optional extra column: id). Type "no" under available to hide an item (sold out).
  3. File > Share > Publish to web > choose the sheet, format "Comma-separated values (.csv)" > Publish.
  4. Copy the link and paste it into SHEET_CSV_URL in script.js. Save and upload the site again once.
  5. From now on, change the sheet and the website updates itself (can take a few minutes).
  If the sheet can't load, the site falls back to the PRODUCTS list in script.js.

SHARED PHONES / TABLETS (privacy)
  After an order is sent, the customer sees an "Order sent" summary where they can fix mistakes
  (the corrected message is marked CORRECTED so you know to ignore the first one) or press
  "Done - start a new order". Nothing is kept once they finish, the tab is closed, or the page is
  idle for IDLE_MINUTES (set in script.js, 0 = off).
