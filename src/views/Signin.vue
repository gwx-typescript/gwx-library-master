<template>
  <div class="signin">
    <v-card class="ma-5 pa-2">
      <v-card-title class="font-weight-bold">ログイン</v-card-title>
      <div class="pa-2">
        <v-text-field v-model="email" required label="メールアドレス"></v-text-field>
      </div>
      <div class="pa-2">
        <v-text-field v-model="password" required label="パスワード" :type="'password'"></v-text-field>
      </div>
    </v-card>
    <v-btn @click="signIn" color="info" class="mt-2">ログイン</v-btn>
    <br />
    <p class="mt-2 overline">アカウントをまだ作成していない方</p>
    <router-link to="/signup">
      <v-btn color="info" class>アカウント新規作成</v-btn>
    </router-link>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'Signin',
  data: function () {
    return {
      email: '',
      password: '',
      snackbar: false,
      snackbarText: ''
    }
  },
  methods: {
    signIn: function () {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(
          user => {
            this.$router.push('/', function () { })
          },
          err => {
            alert(err.message)
          }
        ).catch(function (error) {
          console.log(error)
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
.signin {
  margin-top: 20px;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
input {
  margin: 10px 0;
  padding: 10px;
}
</style>
