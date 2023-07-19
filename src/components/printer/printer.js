import { Dialog } from 'quasar'
async function requestDevice (SERVICE) {
    try {
        return new Promise(async (resolve, reject) => {
            Dialog.create({ message: 'Impresora no conectada presiona ok para conectarla', }).onOk(async()=> {
                await navigator.bluetooth.requestDevice({ filters: [{ services: [SERVICE]}] }).then((x)=> resolve(x))
            }).onCancel(()=> {
                reject()
                throw 'User Canceled'
            })
           })
    } catch (error) {
        throw 'Error while connecting to printer'
    }
  }
  export const printRequest = async function (command, device) {
    console.log({ device: device })
    if (device.gatt !== undefined && device.gatt.connect) {
        return printCommand(command, device)
    }
    var SERVICE = '000018f0-0000-1000-8000-00805f9b34fb';
    let dev = await requestDevice(SERVICE)
    return printCommand(command, dev)
  }
const printCommand = async function (command, device) {

    var SERVICE = '000018f0-0000-1000-8000-00805f9b34fb';
    var WRITE = '00002af1-0000-1000-8000-00805f9b34fb';
    let gatt
    try {
        // console.log({device})
      let printerDevice = device
      gatt = printerDevice.gatt
      let server = await gatt.connect()
      let service = await server.getPrimaryService(SERVICE)
      let channel = await service.getCharacteristic(WRITE)
      let qr = Uint8Array.from(printQR(command).split('').map(c => {
        let code = c.charCodeAt(0)
        return translate[code] || code
    }))
      await batchWrite(channel, qr)
      return gatt
    } catch (error) {
      console.error(error)
    }

}
  export const print = async function (base64) {
    // console.log({qr: qrcode.value.$el})
    // return printQR ()
    var SERVICE = '000018f0-0000-1000-8000-00805f9b34fb';
    var WRITE = '00002af1-0000-1000-8000-00805f9b34fb';

    var DATA =  '________________________________' + '\x0A' + '\n\n\n';
        // + '\x1B' + '\x61' + '\x31'                                              // center align
        // // + '\x1D' + '\x21' + '\x11' + 'Hello\nBluetooth!\n\n'                    // double font size
        // + '\x1D' + '\x21' + '\x00' + '... from your friends\nat https://qz.io'  // normal font size
        // // + '\n\n\n\n\n\n\n';                                                  // feed paper
        let gatt
    try {
      printerDevice = await requestDevice(SERVICE)
      gatt = printerDevice.gatt
      let server = await gatt.connect()
      let service = await server.getPrimaryService(SERVICE)
      let channel = await service.getCharacteristic(WRITE)
      // let qr = new TextEncoder().encode(printQR())
      let qr = Uint8Array.from(printQR().split('').map(c => {
        let code = c.charCodeAt(0)
        return translate[code] || code
    }))
      // return channel.writeValue(new TextEncoder("cp850").encode(DATA))
      return batchWrite(channel, qr)
    } catch (error) {
      console.error(error)
    }

}
async function batchWrite (channel, qr) {
var index = 0;
return sendNextImageDataBatch(channel, qr)
async function sendNextImageDataBatch(channel, data) {
        // Can only write 512 bytes at a time to the characteristic
        // Need to send the image data in 512 byte batches
        console.log({data})
        const maxLen = 256
if (index + maxLen < data.length) {
  return channel.writeValue(data.slice(index, index + maxLen)).then(() => {
    index += maxLen;
    return sendNextImageDataBatch(channel, data);
  })
  .catch(error => {throw error});
} else {
  // Send the last bytes
  if (index < data.length) {
    return channel.writeValue(data.slice(index, data.length))
    .catch(error => {throw error});
  }
}
}
}

function printQR (command) {
       let printer = {
          cpl: 32,
          encoding: 'multilingual',
          upsideDown: false,
          gamma: 1,
          command: 'generic'
      };
      let receipt = receiptline.transform(command, printer)
      console.log({receipt})
      return receipt
}
var translate = {
    149: 196,
   156: 218,
   157: 191,
   159: 217,
   150: 179,
   158: 192
   }