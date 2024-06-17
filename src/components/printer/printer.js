import { Dialog } from 'quasar'

async function requestDevice () {
    try {
      return new Promise(async (resolve, reject) => {
        Dialog.create({ message: 'Impresora no conectada presiona ok para conectarla', }).onOk(async()=> {
          await navigator.usb.requestDevice({ filters: [] })
          .then((x)=> resolve(x))
        }).onCancel(()=> {
          reject()
          throw 'User Canceled'
        })
      })
    } catch (error) {
      throw 'Error while connecting to printer'
    }
  }
  
  export const printRequest = async function (command, device = {}) {
    console.log('printRequest',{ device: device })
    if (device.opened) {
      return printCommand(command, device)
    }
    let dev = await requestDevice()
    return printCommand(command, dev)
  }
  
  const printCommand = async function (command, device) {
    let gatt
    try {
      console.log('printcommand', {device, command})
      let printerDevice = device
      gatt = printerDevice
      let server = await gatt.open()
      // Add your code here to interact with the device.
      // This might involve sending commands, etc.
    } catch (error) {
      console.error(error)
    }
  }
  
  export const print = async function (base64) {
    let gatt
    try {
      printerDevice = await requestDevice()
      gatt = printerDevice
      await gatt.open()
      // Add your code here to interact with the device.
      // This might involve sending commands, etc.
    } catch (error) {
      console.error(error)
    }
  }
  
  async function batchWrite (channel, qr) {
    var index = 0;
    return sendNextImageDataBatch(channel, qr)
  
    async function sendNextImageDataBatch(channel, data) {
      const maxLen = 256
      if (index + maxLen < data.length) {
        return channel.transferOut(1, data.slice(index, index + maxLen)).then(() => {
          index += maxLen;
          return sendNextImageDataBatch(channel, data);
        })
        .catch(error => {throw error});
      } else {
        if (index < data.length) {
          return channel.transferOut(1, data.slice(index, data.length))
          .catch(error => {throw error});
        }
      }
    }
  }
  
  export async function printDialog(command) {
    try {
      return printRequest(command);
    } catch (error) {
      throw 'Error while printing';
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
// async function requestDeviceSerial() {
//   try {
//     const port = await navigator.serial.requestPort();
//     // The user has granted permission to access the selected serial device
//     return port;
//   } catch (error) {
//     // The user did not grant permission to access any serial devices
//     console.log('User did not grant permission to access any serial devices');
//   }
// }

// async function printCommandSerial(command, port) {
//   try {
//     await port.open({ baudRate: 115200 });
//     // Send the print command to the printer
//     const writer = port.writable.getWriter();
//     await writer.write(command);
//     writer.releaseLock();
//   } catch (error) {
//     console.error(error);
//   }
// }

