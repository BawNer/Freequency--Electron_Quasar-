import { getDatabase, ref, get, child } from 'firebase/database'
import { boot } from 'quasar/wrappers'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDx73VVJjnkuhLVbqyvcQlLOMxMB3eLs-c",
  authDomain: "electron-quasar.firebaseapp.com",
  databaseURL: "https://electron-quasar-default-rtdb.firebaseio.com",
  projectId: "electron-quasar",
  storageBucket: "electron-quasar.appspot.com",
  messagingSenderId: "346307454309",
  appId: "1:346307454309:web:c8f760ef0a3451b6f6ed8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app)

const getDataFromDb = async model => {
  try {
    const response = await get(child(ref(database), `${model}DefaultValue/`))
    if (response.exists()) {
      return response.val()
    } else {
      return Promise.reject('No data available')
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export default boot(({app}) => {
  app.provide('firebase', getDataFromDb)
})
