<template>
  <div class="signup">
    <v-card class="ma-5 pa-2">
      <v-card-title class="font-weight-bold">アカウントの作成</v-card-title>
      <div class="pa-2">
        <v-text-field v-model="email" label="メールアドレス"></v-text-field>
      </div>
      <div class="pa-2">
        <v-text-field v-model="password" label="パスワード" :type="'password'"></v-text-field>
      </div>
      <div class="pa-2">
        <v-text-field v-model="displayName" label="名前"></v-text-field>
      </div>
    </v-card>
    <v-btn @click="signUp" color="info" class="mt-2">アカウント作成</v-btn>
    <br />
    <p class="mt-2 overline">アカウントを作成済みの方</p>
    <router-link to="/signin">
      <v-btn color="info" class>ログイン</v-btn>
    </router-link>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'Signup',
  data () {
    return {
      email: '',
      password: '',
      displayName: ''
    }
  },

  created: function () {
    this.db = firebase.firestore() // dbインスタンスを初期化
  },

  methods: {
    signUp: function () {
      // 必須チェック
      if (!this.email || !this.password || !this.displayName) {
        alert('未入力の項目があります')
        return
      }

      // パスワード文字数チェック
      if (this.password.length < 6) {
        alert('パスワードは6文字以上設定して下さい')
        return
      }

      // アカウント作成
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then(data => {
          // ユーザー名更新
          data.user.updateProfile({
            displayName: this.displayName
          }).then(() => {
            alert('アカウントが新規作成されました。 ユーザーID: ' + data.user.email)

            // usersテーブル登録
            this.registerUser()

            // ログイン処理
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
          })
        })
        .catch(error => {
          alert(error.message)
        })
    },
    registerUser () {
      let self = this
      // ユーザー情報登録処理
      let usersCollection = self.db.collection('users')
      usersCollection.add({
        email: self.email,
        password: self.password,
        displayName: self.displayName,
        adminFlg: false
      }).then(function (docRef) {
        // 保存に成功した時
        console.log('Document written with ID: ', docRef.id)
      }).catch(function (error) {
        // 保存に失敗した時
        console.error('Error adding document: ', error)
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
a {
  color: #42b983;
}
.signup {
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
