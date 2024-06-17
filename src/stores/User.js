import { defineStore } from "pinia";
import axios from "axios";
import { useRouter } from "vue-router";
import { ref }  from "vue"
import { api } from "src/boot/axios";
import {jwtDecode} from 'jwt-decode';
import { Notify } from "quasar";
export const useUsersStore = defineStore("User", () => {
  const device = ref({ l: "gg" });
  const selectedUser = ref({ uid: "nadie" });
  const currentUser = ref({ _id: null });
  const token = ref(null)
  const user = ref(null)
  const list = ref([]);
  const lastUser = ref(null);
  async function queryUsers() {
    try {
      const response = await api.get("/users");
      list.value = response.data;
      lastUser.value = response.data[0];
    } catch (error) {
      console.error(error);
    }
  }
  async function registerUser(form) {
    try {
      console.log({form});
      let date = new Date();
      const response = await api.post(`/users`, {
        ...form,
        dateIn: date,
        lastModified: date,
      });
      list.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  async function register(email, password) {
    try {
      const response = await api.post('/users', { email, password });
      token.value = response.data.token;
      user.value = jwtDecode(token.value);
      currentUser.value = response.data.user._id
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    } catch (error) {
      console.error(error);
    }
  }
  async function login (email, password) {
    try {
      const response = await api.post('/users/login', { email, password });
      token.value = response.data.token;
      user.value = jwtDecode(token.value);
      currentUser.value = response.data.user
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      return response.data
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) {
        Notify.create({message: error.response.data.error, color: 'red'})
      }
      console.log({error})
    }
  }
  function logout () {
    token.value = null;
    user.value = null;
    delete api.defaults.headers.common['Authorization'];
  }
  async function sendSingInLink(email) {
    try {
      const response = await axios.post("http://localhost:3000/sendSignInLink", { email });
      console.log("Successful");
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async function LoginWithEmail(email, href) {
    try {
      const response = await axios.post("http://localhost:3000/loginWithEmail", { email, href });
      await registerUser();
      useRouter().push({ path: "" });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async function set(payload) {
    try {
      const response = await api.patch(`/users/${currentUser.value._id}`, {
        ...payload,
        lastModified: new Date(),
      });
      
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  async function setOther(payload) {
    try {
      const response = await api.patch(`/users/${payload._id}`, {
        ...payload,
        lastModified: new Date(),
      });
      const index = list.value.findIndex((user) => user._id === payload._id);
      if (index !== -1) {
        list.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  return {
    register,
    login,
    logout,
    queryUsers,
    list,
    device,
    user,
    selectedUser,
    currentUser,
    setOther,
    registerUser,
    sendSingInLink,
    LoginWithEmail,
    set,
  };
});
