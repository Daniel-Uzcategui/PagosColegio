import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { Loading } from "quasar";
import { api } from "src/boot/axios";

export const useCuotaStore = defineStore("Cuotas", () => {
  const BCV = ref(0);
  const list = ref([]);
  const cuotas = ref([]);
  async function getBCV() {
    if (BCV.value === 0) {
      try {
        const response = await api.get("/bcv");
        BCV.value = response.data.rateValue;
        return response.data.rateValue;
      } catch (error) {
        console.error(error);
      }
    } else {
      return BCV.value;
    }
  }
async function queryCuotas(id, periodoTo = null, remainingAmountDue = null, periodoFrom  = null) {
  try { 
    Loading.show();
    const response = await api.get(`/students/${id}/cuota_payments`, {
      params: {
        periodoTo: periodoTo,
        remainingAmountDue: remainingAmountDue,
        periodoFrom:  periodoFrom
      }
    });
    list.value = response.data;
    return response.data
  } catch (error) {
    console.error(error);
  } finally {
    Loading.hide();
  }
}
async function deleteCuotaBatch(cuota){
  try {
    Loading.show();
    console.log(cuota)
    const response = await api.delete(`/cuotas/${cuota._id}`);
    // if response succesfull update list
    if (response.status === 200) {
      const index = cuotas.value.findIndex((cuota) => cuota._id === cuota._id);
      if (index !== -1) {
        cuotas.value.splice(index, 1);
      }
    }
    return response
  } catch (error) {
    console.error(error);
  } finally {
    Loading.hide();
  }
}
  async function addStudentCuota(payload) {
    try {
      Loading.show();

      let date = new Date();
      const response = await api.post(`/students/${payload.studentId}/cuota_payments`, {
        ...payload,
        dateIn: date,
        lastModified: date,
      });
      console.log({response})
      list.value.push(response.data)
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      Loading.hide();
    }
  }
    // Add this method to your cuota store
      async function addBatchCuota(payload) {
        try {
          Loading.show();

          const response = await api.post('/cuotas/batch', payload);
          const batchCuota = response.data;

          // Update the list of cuotas in the store
          cuotas.value.push(...batchCuota.studentIds.map(studentId => ({
            Alias: payload.Alias,
            Monto: payload.Monto,
            Periodo: payload.Periodo,
            dateIn: payload.dateIn,
            userId: payload.userId,
            cuotaDefault: { Alias: payload.Alias, Monto: payload.Monto, Periodo: payload.Periodo, dateIn: payload.dateIn, userId: payload.userId, cuotaId: batchCuota._id },
            studentId
          })));

          return batchCuota;
        } catch (error) {
          console.error(error);
          throw error;
        } finally {
          Loading.hide();
        }
      }

  async function set(payload) {
    try {
      Loading.show();
      const studentId  =  payload.studentId || payload.cuotaInfo?.student.id
      const response = await api.patch(`/students/${studentId}/cuota_payments/${payload._id}`, {
        ...payload,
        lastModified: new Date(),
      });
      const index = list.value.findIndex((cuota) => cuota._id === payload._id);
      if (index !== -1) {
        list.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      Loading.hide();
    }
  }

  async function del(payload) {
    try {
      Loading.show();

      const response = await api.delete(`/students/${payload.studentId}/cuota_payments/${payload._id}`);
      const index = list.value.findIndex((cuota) => cuota._id === payload._id);
      if (index !== -1) {
        list.value.splice(index, 1);
      }
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      Loading.hide();
    }
  }
  //  define updateMontoIn
  async function updateMontoIn(payload) {
    try {
      Loading.show();
      const response = await api.patch(`/students/${payload.studentId}/cuota_payments/${payload._id}`, {
        ...payload
      });
      const index = list.value.findIndex((cuota) => cuota._id === payload._id);
      if (index !== -1) {
        list.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      Loading.hide();
    }
  }
  
  return {
    addStudentCuota,
    deleteCuotaBatch,
    updateMontoIn,
    set,
    list,
    queryCuotas,
    addBatchCuota,
    cuotas,
    del,
    getBCV,
  };
});
