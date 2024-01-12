import { fetchFromServer } from './fetchFromServer';

export async function onRequest(props, pagination, serverPagination, rows) {
  console.log('Making request', {props, pagination, serverPagination, rows})
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const fetchCount = rowsPerPage;
  const filter = props.filter;

  serverPagination.loading = true;

  // calculate starting row of data
  const startRow = (page - 1) * rowsPerPage;

  let returnedData
  // fetch data from "server"
  if (typeof filter === 'string') {
    returnedData = await fetchFromServer(startRow, fetchCount, filter, null, sortBy, descending, serverPagination);
  } else if (typeof filter === 'object' && filter.from && filter.to) {
    returnedData = await fetchFromServer(startRow, fetchCount, filter.from, filter.to, sortBy, descending, serverPagination);
  }
  // clear out existing data and add new
  rows.splice(0, rows.length, ...returnedData.data);

  // update lastDocument
  serverPagination.lastDocument = returnedData.lastDoc;

  // don't forget to update local pagination object
  pagination.page = page;
  pagination.rowsPerPage = rowsPerPage;
  pagination.sortBy = sortBy;
  pagination.descending = descending;

  // ...and turn of loading indicator
  serverPagination.loading = false;
}
