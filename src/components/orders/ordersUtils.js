import { printRequest } from '../printer/printer.js'
export const printContent = async (row, device) => {
    var printDevice
    try {
      let items = ''
      for (let i of row.cart) {
        items = items + `|${i.name}|x${i.quantity}|` + '\n'
      }
      printDevice = await printRequest(`
      |^\`Mesa ${row.table} ${getHours(row.dateIn)}|
      |Plato|Cantidad|
      ${items}
      `, device)
      
    } catch (error) {
      console.error(error)
    }
    return printDevice
  }

export const getHours = (dateIn) => {
    let date = new Date(dateIn.seconds*1000)
    let h = date.getHours()
    let m = date.getMinutes().toString()
    m = m.length === 1 ? '0' + m : m
    return h + ":" + m
  }