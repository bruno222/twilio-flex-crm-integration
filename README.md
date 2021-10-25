## Not production ready!

This is far away from production ready.

It is just an example of a `SAP C4C` system communicating with `Twilio Flex`.

The SAP part is still missing on this repo. This repo only shows the `Flex` part and an example on what would SAP be using a simple `parent.html` to communicate with `Flex` in the `iFrame` via `.postMessage()`.

## How to use this repo?

### Installing:

- clone this repo
- `npm install`
- `npm start`
- go to `http://localhost:3000/parent.html` - This parent.html simulates the parent window (in this case, it would be the SAP itself)

### Running the tests:

- **Outbound call test**: click on the `Example of click to call from SAP...` that you find at `http://localhost:3000/parent.html` to start doing an Outbound call from SAP.

- **Innbound call test**: call a phone number you have configured to reach Twilio Flex (which I am not explaining here how to do this part). Once the call arrives on Flex and you accept it, the `Parent window` will receive the notification from `window.postMessage()`, which you can see this happening reading the **Debugging** part below.

- **Debugging**: Open `Chrome Console` and filter the logs using `SAP-parent` or `SAP-plugin` or simply `SAP` - You will see the communication from Flex <> SAP happening.
