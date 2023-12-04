<template>
      <q-table
        ref="tableRef"
        title="Reporte Caja"
        :rows="rows"
        :columns="columns"
        row-key="id"
        binary-state-sort
        :visible-columns="visibleColumns"
      >
      <!-- idea para luego transition -->
      <!-- <template v-slot:body="props">
    <transition-group name="list" tag="tbody">
      <q-tr
        v-for="(row, index) in props.row"
        :key="index"
        tag="tr"
      >
      <q-td>
            {{ row }}
    </q-td>
      </q-tr>
    </transition-group>
  </template> -->
      <template v-slot:top-right>
        <div class="row justify-end full-width">
        <q-select
          class="q-pa-xs"
          v-model="visibleColumns"
          multiple
          outlined
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          options-cover
          style="min-width: 150px"
        />
        <q-select
        class="q-pa-xs"
          v-model="selectedUser"
          outlined
          dense
          options-dense
          option-label="name"
          emit-value
          map-options
          :options="['Todos',...users]"
          option-value="id"
          options-cover
          style="min-width: 150px"
        />
        <q-btn-group class="q-ma-xs">
            <q-btn size="md" icon="event" color="secondary" label="Rango de Fecha" no-caps>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date minimal v-model="range" range>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-btn>
              <q-btn
              color="green"
              icon-right="archive"
              label="Exportar a csv"
              no-caps
              @click="exportTable"
            />
        </q-btn-group>
    </div>
      </template>
    </q-table>
    <div>
        <!-- <transition
  appear
  enter-active-class="animated fadeIn"
  leave-active-class="animated fadeOut"
> -->
          
            <q-table
            v-if="totals.Todos"
            title="Totales por tipo de pago"
            :rows="Object.entries(totals)"
            :columns="[
                { name: 'Tipo', required: true, label: 'Tipo de pago', field: '0' },
                { name: 'Total', required: true, label: 'Total', field: '1' },
            ]"
    />
        <!-- </transition> -->
  </div>
  </template>
  <script setup>
  import { collection, collectionGroup, query, where } from 'firebase/firestore';
import { db } from 'src/boot/vuefire';
import { computed, ref } from 'vue';
import { useCollection } from 'vuefire';
import { exportFile } from 'quasar'
function exportTable () {
        // naive encoding to csv format
        const content = [columns.map(col => wrapCsvValue(col.label))].concat(
          rows.value.map(row => columns.map(col => wrapCsvValue(
            typeof col.field === 'function'
              ? col.field(row)
              : row[ col.field === void 0 ? col.name : col.field ],
            col.format,
            row
          )).join(','))
        ).join('\r\n')

        const status = exportFile(
          'table-export.csv',
          content,
          'text/csv'
        )

        if (status !== true) {
          $q.notify({
            message: 'Browser denied file download...',
            color: 'negative',
            icon: 'warning'
          })
        }
      }
      function wrapCsvValue (val, formatFn, row) {
        let formatted = formatFn !== void 0
            ? formatFn(val, row)
            : val

        formatted = formatted === void 0 || formatted === null
            ? ''
            : String(formatted)

        formatted = formatted.split('"').join('""')
        /**
         * Excel accepts \n and \r in strings, but some other CSV parsers do not
         * Uncomment the next two lines to escape new lines
         */
        // .split('\n').join('\\n')
        // .split('\r').join('\\r')

        return `"${formatted}"`
        }
  const visibleColumns = ref([ "dateIn", "fechaPago", "Monto", "MontoTotalBS", "TasaBCV", "Tipo", "Referencia", "CuotaName" ])
  const props = defineProps(['houseHold', 'houseHoldHistoryOpen'])
  const optionsTipos = ['Punto de venta', 'Efectivo $', 'Efectivo BS', 'Zelle', 'Pago Movil', 'Transferencia', 'Otros']
  const range = ref(new Date())
  const selectedUser = ref('Todos')
  const columns = [
    { "name": "dateIn", "label": "Fecha Registro", "field": (row) => toDateLocate(row.dateIn, true), "align": "left", "sortable": true },
    { "name": "fechaPago", "label": "Fecha de Pago", "field": row => toDateLocate(row.fechaPago), "align": "left", "sortable": true },
    { "name": "Monto", "label": "Monto$", "field": (row) => row.Monto.toFixed(2), "align": "left", "sortable": true },
    { "name": "MontoTotalBS", "label": "MontoBS", "field": (row) => row.MontoTotalBS.toFixed(2), "align": "left", "sortable": true },
    { "name": "TasaBCV", "label": "TasaBCV", "field": "TasaBCV", "align": "left", "sortable": true },
    { "name": "Tipo", "label": "Cédula estudiante", "field": "Tipo", "align": "left", "sortable": true },
    { "name": "Referencia", "label": "Referencia", "field": "Referencia", "align": "left", "sortable": true },
    { "name": "CuotaName", "label": "Cuota", field: row=> row.cuotaInfo.Alias, "align": "left", "sortable": true },  
  ]
  const users = useCollection(collection(db, 'users'))
    const tableRef = ref()
    function addDays(date, days = 0) {
        if (!date.from) {
            if (days) {
                var result = new Date(date);
                result.setDate(result.getDate() + 1);
                return new Date(result);
            }
            return new Date(date)
        }
        if (days) {
            var result = new Date(date.to);
                result.setDate(result.getDate() + 1);
                return new Date(result);
        }
        return new Date(date.from)
    }

    const compQuery = computed(() => query(collectionGroup(db, 'payments'),
    where('dateIn', '>=', addDays(range.value)),
    where('dateIn', '<=',  addDays(range.value, 1)),
    ...(selectedUser.value !== 'Todos' ? [where('cajaUser.id', '==', selectedUser.value)] : [])
    ))
    const rows = useCollection(compQuery)
    function toDateLocate(date, hours = false) {
        return date.toDate().toLocaleDateString('es-MX', hours ? {
            hour: 'numeric',
            hour12: hours
        } : {});
    }

    const totals = computed(() => {
    const totalsByType = {};
    optionsTipos.forEach(type => {
        const total = rows.value
        .filter(row => row.Tipo === type)
        .reduce((total, row) => total + parseFloat(row.Monto), 0)
        if (total) {
            totalsByType[type] = total;
        }
    });
    totalsByType['Todos'] = rows.value
        .reduce((total, row) => total + parseFloat(row.Monto), 0);
    return totalsByType;
    });
  </script>
  <style>
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

</style>