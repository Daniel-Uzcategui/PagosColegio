import axios from 'axios';
import { api } from 'src/boot/axios';

export async function fetchFromServer(startRow, count, from, to, sortBy, descending, serverPagination) {
  try {
    let sort = sortBy === 'desc' ? serverPagination.defaultColumn : sortBy;
    let desasc = descending ? 'desc' : 'asc'
    let docData = [];
    const response = await api.get(`/${serverPagination.callerCollection}`, {
      params: {
        _start: startRow,
        _limit: count,
        _sort: sort,
        _order: desasc,
        ...(from && to ? { ['_gte']: from, ['_lte']: to } :  from  ? {['_gte']: from}  : {}),
      },
    });
    docData = response.data;
  
    return { data: docData, lastDoc: docData[docData.length -1] };
    
  } catch (error) {
    console.error(error)
    throw error
  }
}