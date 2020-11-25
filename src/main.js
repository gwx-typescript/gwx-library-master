import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import vuetify from './plugins/vuetify'
import Firebase from 'firebase'
import 'firebase/firestore'

Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: 'AIzaSyCHqKN74WRetFC09vSQnTSJDso34qpgVmQ',
  authDomain: 'gwx-library2020.firebaseapp.com',
  databaseURL: 'https://gwx-library2020.firebaseio.com',
  projectId: 'gwx-library2020',
  storageBucket: 'gwx-library2020.appspot.com',
  messagingSenderId: '591070281636',
  appId: '1:591070281636:web:a9a6e8da94fa8ae3838b31'
}

const firebaseApp = Firebase.initializeApp(firebaseConfig)
const firestore = firebaseApp.firestore()

Firebase.auth().setPersistence(Firebase.auth.Auth.Persistence.LOCAL)

export default firestore

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
