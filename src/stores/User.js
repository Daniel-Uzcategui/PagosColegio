import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "src/boot/vuefire";
import {
  getAuth,
  sendSignInLinkToEmail,
  linkWithCredential,
  EmailAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { useDocument } from "vuefire";

export const useUsersStore = defineStore(
  "User",
  () => {
    try {
      const device = ref({l:'gg'})
      const rolesPermissions = {
        Admin: ["del", "add", "set", "manageRoles"],
        Collaborator: ["del", "add", "set"],
        Viewer: [],
      };
      const selectedUser = ref({ uid: "nadie" });
      const currentUser = ref({ uid: "nadie" });
      const currentUserRef = computed(() =>
        doc(collection(db, "users"), currentUser.value?.uid || "nadie")
      );
      const currentUserDoc  = useDocument(currentUserRef);
      async function registerUser(form) {
        let Doc = {
          id: currentUser.value.uid,
          email: currentUser.value.email,
        };
        if (form.value?.name) {
          Doc.name = form.value.name;
        }
        await setDoc(currentUserRef.value, Doc);
      }
      const auth = getAuth();
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: "https://ecr7xo3y.web.app/login",
        // This must be true.
        handleCodeInApp: true,
      };
      async function LoginWithEmail() {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          // Additional state parameters can also be passed via URL.
          // This can be used to continue the user's intended action before triggering
          // the sign-in operation.
          // Get the email if available. This should be available if the user completes
          // the flow on the same device where they started it.
          let email = window.localStorage.getItem("emailForSignIn");
          if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt("Please provide your email for confirmation");
          }
          // The client SDK will parse the code from the link for you.
          signInWithEmailLink(auth, email, window.location.href)
            .then(async (result) => {
              // Clear email from storage.
              window.localStorage.removeItem("emailForSignIn");
              // You can access the new user via result.user
              // Additional user info profile not available via:
              // result.additionalUserInfo.profile == null
              await registerUser();
              useRouter().push({ path: "" });
              // You can check if the user is new or existing:
              // result.additionalUserInfo.isNewUser
            })
            .catch((error) => {
              // Some error occurred, you can inspect the code: error.code
              // Common errors could be invalid email and invalid or expired OTPs.
              console.error(error);
            });
        }
      }
      async function loginWithCredential() {
        const credential = EmailAuthProvider.credentialWithLink(
          email,
          window.location.href
        );

        // Link the credential to the current user.
        const auth = getAuth();
        linkWithCredential(auth.currentUser, credential)
          .then((usercred) => {
            // The provider is now successfully linked.
            // The phone user can now sign in with their phone number or email.
          })
          .catch((error) => {
            // Some error occurred.
          });
      }
      async function sendSingInLink(email) {
        return sendSignInLinkToEmail(auth, email, actionCodeSettings)
          .then(() => {
            // The link was successfully sent. Inform the user.
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            console.log("Succesfull");

            window.localStorage.setItem("emailForSignIn", email);
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(error);
          });
      }
      async function set(payload) {
        try {
          const docRef = doc(db, "users/", currentUser.value.uid);
          await setDoc(
            docRef,
            {
              ...payload,
              lastModified: new Date(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error(error);
        }
      }
      return {
        currentUser,
        selectedUser,
        currentUserRef,
        currentUserDoc,
        device,
        set,
        registerUser,
        sendSingInLink,
        LoginWithEmail,
      };
    } catch (error) {
      console.error(error);
    }
  },
  {
    persist: {
      paths: [
        "currentUser",
        "device",
        "selectedUser",
        "currentUserRef",
        "currentUserDoc",
      ],
    },
  }
);
