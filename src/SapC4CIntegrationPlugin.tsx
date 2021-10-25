import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

const PLUGIN_NAME = 'SapC4CIntegrationPlugin';

export default class SapC4CIntegrationPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex: typeof Flex, manager: Flex.Manager) {
    //
    // Hide right-hand side panel from Flex, to keep it small
    //
    flex.AgentDesktopView.defaultProps.showPanel2 = false;

    //
    // Inbound Call -> Open SAP CTI screen
    //
    (manager.workerClient as any).on('reservationCreated', (reservation: any) => {
      console.log('SAP-plugin - reservationCreated', reservation);
      const taskSid = reservation.task.sid;

      if (reservation.task.taskChannelUniqueName === 'voice') {
        // Inbound Calls
        if (reservation.task.attributes.direction !== 'outbound') {
          const payload = {
            Action: 'ACCEPT',
            Type: 'CALL',
            ANI: reservation.task.attributes.caller,
            DNIS: reservation.task.attributes.caller,
            EventType: 'INBOUND',
            ExternalReferenceID: taskSid,
            ExternalOriginalReferenceID: taskSid,
          };

          console.log('SAP-plugin - sending postMessage payload to SAP (1):', payload);
          window.parent.postMessage({ payload }, '*');
          return;
        }

        // Outbound calls
        // (does it needed? isn't this redundant with click-to-call logic below?)
        const payload = {
          Action: 'ACCEPT',
          Type: 'CALL',
          EventType: 'OUTBOUND',
          ANI: reservation.task.attributes.outbound_to,
          DNIS: reservation.task.attributes.outbound_to,
          ExternalReferenceID: taskSid,
          ExternalOriginalReferenceID: taskSid,
        };

        console.log('SAP-plugin - sending postMessage payload to SAP (2):', payload);
        window.parent.postMessage({ payload }, '*');
      }
    });

    //
    // When the Agent finishes the call (not the customer) -> We send the notification to SAP about that
    //
    flex.Actions.addListener('beforeHangupCall', (reservation) => {
      console.log('SAP-plugin - beforeHangupCall', reservation);
      const taskSid = reservation.task.taskSid;

      if (reservation.task.taskChannelUniqueName === 'voice') {
        let payload: any = {
          Type: 'CALL',
          EventType: 'CallEnded',
        };

        if (reservation.task.attributes.direction !== 'outbound') {
          payload = {
            ...payload,
            ANI: reservation.task.attributes.caller,
            DNIS: reservation.task.attributes.caller,
            ExternalReferenceID: taskSid,
            ExternalOriginalReferenceID: taskSid,
          };
        } else {
          payload = {
            ...payload,
            ANI: reservation.task.attributes.outbound_to,
            DNIS: reservation.task.attributes.outbound_to,
            ExternalReferenceID: taskSid,
            ExternalOriginalReferenceID: taskSid,
          };
        }

        console.log('SAP-plugin - sending postMessage payload to SAP (3):', payload);
        window.parent.postMessage({ payload }, '*');
      }
    });

    //
    // Outbound call from SAP click-to-call
    //
    const onMessage = (flex: typeof Flex, Manager: Flex.Manager, event: any) => {
      console.log('SAP-plugin - postMessage received for the click-to-call: ', event.data);

      try {
        flex.Actions.invokeAction('StartOutboundCall', {
          destination: event.data.PhoneNumber.replace(/\D/g, ''),
        });
      } catch (e) {
        console.log('SAP-plugin - Error while calling StartOutboundCall: ', e);
      }
    };

    window.addEventListener('message', onMessage.bind(null, flex, manager), false);
  }
}
