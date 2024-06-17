import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { Loading } from "quasar";
import { useCuotaStore } from "./Cuotas";
import { api } from "src/boot/axios";
import { useStudentStore } from "./Students";

export const usePaymentStore = defineStore("Payments", () => {
  const list = ref([]);
  const selectedPayments = ref([])
  async function query(id) {
    try { Loading.show();
      const response = await api.get(`/students/${id}/payments`);
      list.value = response.data;
      return response.data
    } catch (error) {
      console.error(error);
    } finally {
      Loading.hide();
    }
  }
  async function addStudentPayment(id,payload) {
    try {
      Loading.show();

      let date = new Date();
      const response = await api.post(`/students/${id}/payments`, {
        ...payload,
        dateIn: date,
        lastModified: date,
      });
      console.log({response})
      list.value.push(response.data.newPayment)
      for (let i of response.data.updatedCuotaPayments) {
        const index = useCuotaStore().list.findIndex((cuota) => cuota._id === i._id);
        if (index !== -1) {
          useCuotaStore().list[index] = i;
        }
      }
      // Update the student's local data from student store credit from response.data.studentCredit
      
      const index = useStudentStore().list.findIndex((student) => student._id === id);
      console.log({index})
      if (index !== -1) {
        useStudentStore().list[index].credit = response.data.studentCredit;
        console.log({studentCredit: response.data.studentCredit})
      }
      return response.data;
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

      const response = await api.patch(`/students/${payload.studentId}/payments/${payload._id}`, {
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

      const response = await api.delete(`/students/${payload.studentId}/payments/${payload._id}`);
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

  return {
    addStudentPayment,
    set,
    selectedPayments,
    list,
    query,
    del,
  };
});
