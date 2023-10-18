import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

const PLUGIN_NAME = 'TwilioFlexCrmIntegrationV2Plugin';

export default class TwilioFlexCrmIntegrationV2Plugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    //
    // Hide right-hand side panel from Flex, to keep it small
    //
    flex.AgentDesktopView.defaultProps.showPanel2 = false;

    //
    // Once the chat ends, send the chat messages to log('CRM-
    //
    (manager.workerClient as any).on('reservationCreated', (reservation: any) => {
      const listenForStatus = 'wrapup';
      reservation.on(listenForStatus, (payload: any) => {
        console.log('CRM-plugin - Wrapup logic - task just went to Wrap up stage', reservation, payload);
        const { taskChannelUniqueName, attributes, sid } = payload.task;
        const { conversationSid } = attributes;

        if (taskChannelUniqueName !== 'chat') {
          console.log('CRM-plugin - Wrapup logic - exiting... It is not a Chat.');
          return;
        }

        console.log('CRM-plugin - Wrapup logic - Chat Task Attributes:', attributes);

        const chatStore = manager.store.getState().flex.chat.conversations[conversationSid];

        if (!chatStore || !chatStore.messages) {
          console.warn(
            `CRM-plugin - Wrapup logic - Why is this empty? Debug me please pasting 'window.Twilio.Flex.Manager.getInstance().store.getState().flex.chat.conversations' on Chrome Console to see the results...`
          );
          return;
        }

        const messages = manager.store.getState().flex.chat.conversations[conversationSid].messages;

        const chatHistory = [];
        for (let msg of messages) {
          const { authorName, isFromMe, index } = msg;
          const { body, author, timestamp } = msg.source;

          const obj = { authorName, isFromMe, index, body, author, timestamp };
          chatHistory.push(obj);
        }

        console.log('CRM-plugin - Wrapup logic -  TODO: Send this obj to CRM: ', chatHistory);
      });
    });

    //
    // Inbound Call -> Open CRM screen
    //
    (manager.workerClient as any).on('reservationCreated', (reservation: any) => {
      console.log('CRM-plugin - reservationCreated', reservation);
      const taskSid = reservation.task.sid;

      if (reservation.task.taskChannelUniqueName === 'voice') {
        // Inbound Calls
        if (reservation.task.attributes.direction !== 'outbound') {
          const payload = {
            Action: 'ACCEPT',
            Type: 'CALL',
            EventType: 'INBOUND',
            caller: reservation.task.attributes.caller,
            taskSid,
          };

          console.log('CRM-plugin - sending postMessage payload to CRM (1):', payload);
          window.parent.postMessage({ payload }, '*');
          return;
        }

        // Outbound calls
        // (does it needed? isn't this redundant with click-to-call logic below?)
        const payload = {
          Action: 'ACCEPT',
          Type: 'CALL',
          EventType: 'OUTBOUND',
          callTo: reservation.task.attributes.outbound_to,
          taskSid,
        };

        console.log('CRM-plugin - sending postMessage payload to CRM (2):', payload);
        window.parent.postMessage({ payload }, '*');
      }
    });

    //
    // When the Agent finishes the call (not the customer) -> We send the notification to CRM about that
    //
    flex.Actions.addListener('beforeHangupCall', (reservation) => {
      console.log('CRM-plugin - beforeHangupCall', reservation);
      const taskSid = reservation.task.taskSid;

      if (reservation.task.taskChannelUniqueName === 'voice') {
        let payload: any = {
          Type: 'CALL',
          EventType: 'CallEnded',
        };

        if (reservation.task.attributes.direction !== 'outbound') {
          payload = {
            ...payload,
            caller: reservation.task.attributes.caller,
            taskSid,
          };
        } else {
          payload = {
            ...payload,
            callTo: reservation.task.attributes.outbound_to,
            taskSid,
          };
        }

        console.log('CRM-plugin - sending postMessage payload to CRM (3):', payload);
        window.parent.postMessage({ payload }, '*');
      }
    });

    //
    // Receive postMessages from CRM
    //
    const onMessage = async (flex: typeof Flex, Manager: Flex.Manager, event: any) => {
      console.log('CRM-plugin - postMessage received: ', event.data);

      //
      // Make an outbound call
      //
      if (event.data.type === 'call-outbound') {
        try {
          flex.Actions.invokeAction('StartOutboundCall', {
            destination: event.data.PhoneNumber.replace(/\D/g, ''),
          });
        } catch (e) {
          console.log('CRM-plugin - Error while calling StartOutboundCall: ', e);
        }
      }

      //
      // Start a Whatsapp chat with the customer
      //
      if (event.data.type === 'whatsapp-outbound') {
        try {
          /**
           * TODO:
           *
           *     In order to receive Whatsapp messages in your phone, you have to:
           *
           *      1. Get your cellphone and send a message to our Twilio Sandbox number, this will allow you to receive Whatsapp messages while you are not in Production.
           *          a. Go to https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn?frameUrl=%2Fconsole%2Fsms%2Fwhatsapp%2Flearn%3Fx-target-region%3Dus1
           *          b. And send "join something-something" to this number: +1 415 523 8886.
           *
           *      2. Create the Twilio Function like this one: https://gist.github.com/bruno222/2d58b94733605ab0dec7c2d7d91fd1f3
           *          a. once you have it created, change the URL below to your Function URL.
           */
          
          await fetch('https://xxxxxxxx.twil.io/crm-example/send_whatsapp_message', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to: event.data.PhoneNumber, name: event.data.name }),
          });
        } catch (e) {
          console.log('CRM-plugin - Error while sending whatsapp message: ', e);
        }
      }
    };

    window.addEventListener('message', onMessage.bind(null, flex, manager), false);
  }
}
