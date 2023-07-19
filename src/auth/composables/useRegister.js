import {
  useIdentityPasswordRegister,
  getConfig,
  useAuthState,
} from "@vueauth/core";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useUsersStore } from "src/stores/User";

export default () => {
  const router = useRouter();
  const { emailConfirm } = getConfig("identityPassword:register");
  const registered = ref();
  const { user } = useAuthState();
  const {
    form,
    loading,
    errors,
    hasErrors,
    validationErrors,
    hasValidationErrors,
    register,
  } = useIdentityPasswordRegister();

  async function onRegisterClicked() {
    await register();
    if (!hasErrors.value) {
      useUsersStore().currentUser = user.value;
      if (!emailConfirm) {
        router.push({ name: "dashboard" });
        await useUsersStore().registerUser(form);
      }
      registered.value = true;
    }
  }

  return {
    onRegisterClicked,
    form,
    loading,
    errors,
    hasErrors,
    validationErrors,
    hasValidationErrors,
    register,
    router,
    emailConfirm,
    registered,
  };
};
