let senderFrameIndex = 0;
let senderXor = false;
let senderZeroAllDelta = false;
let senderZeroEveryTwo = false;
onmessage = async (evt) => {
    console.log('[webrtc] worker: got message ' + evt)
    if (evt.data.r && evt.data.w) {
        let readable = evt.data.r;
        let writable = evt.data.w;
        console.log('readable = ' + readable);
        console.log('writable = ' + writable);
        //const reader = rs.getReader();
        //const {value, done} = await reader.read();
        //console.log(value); // logs 'hello'.

        console.log('SENDER STREAMS');
        let sender_transform = new TransformStream({
        start() {
            console.log('SENDER START!!!');
        },

        async transform(chunk, controller) {
            // console.log(chunk);
            // console.log('chunk.data = ' + chunk.data);
            // console.log('SENDER chunk.data.length =  ' + chunk.data.byteLength)
            // console.log('SENDER transform')

            //   senderMeter.value = chunk.data.byteLength/50000.0;
            //   senderValueDisplay.innerText = chunk.type + "  " + chunk.data.byteLength;

            // console.log('Sender frame is ', chunk.type);

            let view = new DataView(chunk.data);
            let newData = new ArrayBuffer(chunk.data.byteLength);
            let newView = new DataView(newData);
            for (let i = 0; i < chunk.data.byteLength; ++i)
              newView.setInt8(i, view.getInt8(i));
            // console.log('data[0] = ' + view.getInt8(0));

              ++senderFrameIndex;
              if ((senderZeroEveryTwo && senderFrameIndex % 2 == 0) || (senderZeroAllDelta && chunk.type == "delta")) {
                newView.setInt8(0,0);
              }

            if (senderXor) {
              console.log('SENDER NEGATING');
              //console.log('oldData[0] = ', newView.getUint8(0));
              for (let i = 0; i < chunk.data.byteLength; ++i)
                newView.setInt8(i, ~newView.getInt8(i));
              //console.log('newData[0] = ', newView.getUint8(0));
            } else {
                console.log('SENDER NOT negating');
            }

            // console.log('TS=',chunk.timestamp);
            chunk.data = newData;
            let view2 = new DataView(chunk.data);
            // console.log('view2[0] = ', view2.getUint8(0));
            controller.enqueue(chunk);
            // console.log('SENDER enqueued sender frame');
        },

        flush() {
            console.log('SENDER FLUSH!!!')
        }

        });

        await
        readable
        .pipeThrough(sender_transform)
        .pipeTo(writable)
        .then(() => console.log("All data successfully transformed!"))
        .catch(e => console.error("Something went wrong!", e));
    } else if (evt.data.xor != undefined) {
        senderXor = evt.data.xor;
        console.log('SENDER_WORKER GOT MESSAGE: NEGATING = ' + senderXor);
    }  else if (evt.data.sender_zero_all_data != undefined) {
        senderZeroAllDelta = evt.data.sender_zero_all_data;
        console.log('SENDER_WORKER GOT MESSAGE: senderZeroAllDelta = ' + senderZeroAllDelta);
    }  else if (evt.data.sender_zero_every_two != undefined) {
        senderZeroEveryTwo = evt.data.sender_zero_every_two;
        console.log('SENDER_WORKER GOT MESSAGE: senderZeroAllDelta = ' + senderZeroEveryTwo);
    }
};
