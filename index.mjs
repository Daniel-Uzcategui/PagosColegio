import { readFileSync } from "fs";
import { read, utils } from "xlsx/xlsx.mjs";
import { writeBatch, doc, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "./config/firebase.js";
const firebaseApp = initializeApp(firebaseConfig.credentials);
const db = getFirestore();
const buf = readFileSync("./src/studenstxsl/1st.xls");
const buf2 = readFileSync("./src/studenstxsl/pres.xls");
/* buf is a Buffer */
const workbook = read(buf);
const workbook2 = read(buf2);
sheetToDB(workbook.Sheets[ 'Akdemia' ]).then(()=> {
    sheetToDB(workbook2.Sheets[ 'Akdemia' ])
})

async function sheetToDB(sheet) {
    try {
        const batch = writeBatch(db);
        var jsa = utils.sheet_to_json(sheet);
        for (let i of jsa) {
            let cedula = i['Cédula de identidad']
            cedula = fixCedula(cedula)
            let studentRef = doc(db, "students", cedula);
            batch.set(studentRef, {...i, ['Cédula de identidad']: cedula, Apellido: i.Apellido.toUpperCase(), Nombre: i.Nombre.toUpperCase(), Grado: i.Grado.toUpperCase(), Sección: i.Sección.toUpperCase()});
        }
        return await batch.commit();
    } catch (error) {
        console.error(error)
    } finally {
        console.log('Done')
    }
}
function fixCedula (cedula) {
    let fixed = cedula.toUpperCase()
    fixed = fixed.replace(' ', '')
    fixed = fixed.replace('V-V', 'V-')
    if(cedula.includes('-')) {
        return fixed
    }
    fixed = fixed.slice(0, 1) + "-" + fixed.slice(1);
    if (fixed.includes('V-V')) {
        console.log({fixed, cedula})
    }
    return fixed
}