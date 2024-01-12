import { defineStore } from "pinia";
import axios from 'axios';
import {ref}  from "vue"
import { api } from "src/boot/axios";
export const useStudentStore = defineStore("Students", () => {
  try {
  const list = ref([]);
  const lastStudent = ref(null);

  async function queryStudents() {
    try {
      const response = await api.get("/students");
      list.value = response.data;
      lastStudent.value = response.data[0];
    } catch (error) {
      console.error(error);
    }
  }

  async function add(payload) {
    try {
      let date = new Date();
      const response = await api.post("/students", {
        ...payload,
        dateIn: date,
        lastModified: date,
      });
      list.value.push(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function set(payload) {
    try {
      const response = await api.patch(`/students/${payload._id}`, {
        ...payload,
        lastModified: new Date(),
      });
      const index = list.value.findIndex((student) => student._id === payload._id);
      if (index !== -1) {
        list.value[index] = response.data;
      }
    } catch (error) {
      console.log({error})

      console.error(error);
    }
  }
  async function remove(id) {
    try {
      const response = await api.delete(`/students/${id}`);
      const index = list.value.findIndex((student) => student._id === id);
      if (index !== -1) {
        list.value.splice(index, 1);
      }
    } catch (error) {
      console.error(error);
    }
  }
  // upload students
  async function uploadStudents(payload) {
    try {
      const response = await api.post(`/students/upload`, payload);
      list.value = response.data;
    } catch (error) {
      console.error(error);
    }
  }
  return {
    queryStudents,
    uploadStudents,
    add,
    set,
    list,
    lastStudent,
    remove,
  };
} catch  (e) {
  console.error(e)
}
});
