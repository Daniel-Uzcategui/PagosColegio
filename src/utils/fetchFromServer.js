import { collection, query, orderBy, limit, startAfter, getDocs, where, startAt, endAt } from "firebase/firestore";
import { db } from "src/boot/vuefire";

// emulate ajax call
// SELECT * FROM ... WHERE...LIMIT...
export async function fetchFromServer(startRow, count, from, to, sortBy, descending, serverPagination) {
    console.log('Fetching', {startRow, count, from, to, sortBy, descending, serverPagination})
    let sort = sortBy === 'desc' ? serverPagination.defaultColumn : sortBy;
    // translate values Periodo
    let trl = {PeriodoFrom: 'Periodo.from', PeriodoTo: 'Periodo.to'}
    sort = trl[sort] ? trl[sort] : sort
    let docData = [];
    var coll = collection(db, serverPagination.callerCollection);
    let desasc = descending ? 'desc' : 'asc'
    let q;
    if (!isDate(from)) {
      let filt = from.toUpperCase();
      q = query(coll,
        orderBy(sort, desasc),
        ...(filt !== '' ? [where(sort,'>=', filt), where(sort,'<=', filt + '~')] : []),
        ...(startRow !== 0 ? [startAfter(serverPagination.lastDocument)] : []),
        ...(serverPagination.extraFilter ? [where(serverPagination.extraFilter.key,serverPagination.extraFilter.condition, serverPagination.extraFilter.value)] : []),
        limit(count)
      );
      if (startRow === 0) {
        serverPagination.lastDocument = null;
      }
    } else if (isDate(from)) {
        let fr,tt
        fr = descending ? new Date(from) : new Date(to)
        tt = descending ? new Date(to) : new Date(from)
      q = query(coll,
        orderBy(sort, desasc),
        startAt(tt),
        ...(isDate(to) ? [endAt(fr)] : []),
        ...(startRow !== 0 ? [startAfter(serverPagination.lastDocument)] : []),
        ...(serverPagination.extraFilter ? [where(serverPagination.extraFilter.key,serverPagination.extraFilter.condition, serverPagination.extraFilter.value)] : []),
        limit(count)
      );
      if (startRow === 0) {
        serverPagination.lastDocument = null;
      }
    }

    const docsSnapshots = await getDocs(q);

    docsSnapshots.forEach((doc) => {
      docData.push({...doc.data(), id: doc.id});
    });

    return { data: docData,lastDoc: docsSnapshots.docs[docsSnapshots.docs.length -1] };
}

var isDate = function(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date)) && date !== null;
}