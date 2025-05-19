Smartphone Garden
=================

Your ✨ one-stop gadget shop for phones that bloom with power!

### (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Welcome to Smartphone Garden, where smartphones grow on trees* (*almost)!

Whether you’re after budget buds or flagship flowers, we’ve got something blooming for everyone.

## Setup instructions

1. Register a VNPay merchant account at [VNPay Merchant Registration Page](https://sandbox.vnpayment.vn/devreg). Once finished you will receive an email with the necessary credentials, then you can continue with the setup.

2. Configure the environment variables according to the template:

    | Variable | Description
    | --- | --- |
    | `PORT` | Port for the server to run on (fallbacks to `3000`) |
    | `JWT_SECRET` | Secret key for JWT  |
    | `SESSION_SECRET` | Secret key for session management |
    | `vnp_TmnCode` | VNPay terminal code |
    | `vnp_HashSecret` | VNPay hash secret |
    | `vnp_Url` | VNPay URL |

3. Install Node packages and migrate the database by running:

    ```bash
    npm run build
    ```

4. Start the Express server:

    ```bash
    npm start
    ```

    Congrats! The app is now accessible at [localhost:1234](http://localhost:3030).