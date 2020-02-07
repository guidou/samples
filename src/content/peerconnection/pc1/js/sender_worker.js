let senderXor = false;
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

            //   senderMeter.value = chunk.data.byteLength/50000.0;
            //   senderValueDisplay.innerText = chunk.type + "  " + chunk.data.byteLength;

            let view = new DataView(chunk.data);
            // console.log('data[0] = ' + view.getInt8(0));

            //   ++senderFrameIndex;
            //   if ((senderZeroEveryTwo && senderFrameIndex % 2 == 0) || (senderZeroAllDelta && chunk.type == "delta")) {
            //     view.setInt8(0,0);
            //   }

            if (senderXor) {
                console.log('negating');
                for (let i = 1; i < chunk.data.byteLength; ++i)
                view.setInt8(i, ~view.getInt8(i));
            } else {
                console.log('NOT negating');
            }

            // console.log('TS=',chunk.timestamp);
            controller.enqueue(chunk);
            // console.log('SENDER enqueued sender frame');
        },

        flush() {
            console.log('SENDER FLUSH!!!')
        }

        });

        //await
        readable
        .pipeThrough(sender_transform)
        .pipeTo(writable)
        .then(() => console.log("All data successfully transformed!"))
        .catch(e => console.error("Something went wrong!", e));
    } else if (evt.data.xor != undefined) {
        senderXor = evt.data.xor;
        console.log('SENDER_WORKER GOT MESSAGE: NEGATING = ' + senderXor);
    }
};
