<p align="center" width="100%">
    <img width="100%" src="https://user-images.githubusercontent.com/1012787/170844584-e266c1d9-750e-4edb-a67b-20273f17a444.gif">
</p>

## Not production ready

This is far away from production-ready.

## What is this?

It is just an example of any `CRM` system communicating with `Twilio Flex`.

This repo only shows the `Flex` part and an example of what would be your CRM using a simple `crm.html` to communicate with `Flex` in the `iFrame` via `.postMessage()`.


## Pre-requisites

This repo is purely a **Twilio Flex Plugin**. If you are new to the Flex world, it is better to quick learn how to create Plugins reading [this doc](https://www.twilio.com/docs/flex/quickstart/getting-started-plugin), then you will know how this repository here was created... I just used `twilio flex:plugins:create plugin-sample --install --typescript` to generate the project.

## How to use this repo?

### Installing

- clone this repo
- `npm install`
- `npm start`
- go to `http://localhost:3000/crm.html` - This crm.html simulates the parent window (in this case, it would be your CRM itself)

### Running locally

- **Outbound call test**: click on the `Example of click to call from CRM...` that you find at `http://localhost:3000/crm.html` to start doing an Outbound call from the CRM.

- **Inbound call test**: call a phone number you have configured to reach Twilio Flex (which I am not explaining here how to do this part). Once the call arrives on Flex and you accept it, the `Parent window` will receive the notification from `window.postMessage()`, which you can see this happening reading the **Debugging** part below.

- **Debugging**: Open `Chrome Console` and filter the logs using `CRM-parent` to see what is happening on the CRM side, use `CRM-plugin` to see what is happening on the `Flex` side, or simply use `CRM` to see what is happening on both sides altogether.

### How to deploy

- Once you have adapted and tested all your logic, you can deploy it. Use `npm run build` and `npm run deploy -- --changelog "first deploy"` to deploy the **Flex Plugin** part to **Flex**.
- Then you can enable this Plugin, once deployed, in the [Flex Admin page](https://flex.twilio.com/admin/plugins).
- On CRM, you have to use `https://flex.twilio.com/YOUR_RUNTIME_DOMAIN` as the **iFrame URL**. The "YOUR_RUNTIME_DOMAIN" you can get it [here](https://console.twilio.com/us1/develop/flex/manage/single-sign-on?frameUrl=%2Fconsole%2Fflex%2Fsingle-sign-on%3Fx-target-region%3Dus1).
- Oh, having CORS issues to render Flex into an iFrame? Add the URL of your CRM [in here](https://console.twilio.com/us1/develop/flex/manage/general?frameUrl=%2Fconsole%2Fflex%2Fsettings%3Fx-target-region%3Dus1)
