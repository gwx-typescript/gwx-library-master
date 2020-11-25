<template>
  <form>
    <v-app-bar color="grey lighten-5" flat>
      <v-toolbar-title>
        <v-icon class="mr-2">how_to_vote</v-icon>購入申請
      </v-toolbar-title>
    </v-app-bar>
    <div class="mx-10">
      <v-text-field
        v-model="title"
        :error-messages="titleErrors"
        label="書籍名"
        required
        @input="$v.title.$touch()"
        @blur="$v.title.$touch()"
        class="mt-2"
      ></v-text-field>

      <v-text-field
        v-model="purpose"
        :error-messages="purposeErrors"
        label="購入する目的"
        required
        @input="$v.purpose.$touch()"
        @blur="$v.purpose.$touch()"
        class="mt-2"
      ></v-text-field>

      <v-text-field v-model="amount" label="金額" type="number" class="mt-2"></v-text-field>
      <v-text-field v-model="memo" label="メモ" class="mt-2"></v-text-field>

      <div class="mt-4">
        <v-btn v-bind:disabled="this.$v.$invalid" class="btn mr-4" @click="submit" color="primary">
          <v-icon class="mr-2 pa-1">how_to_vote</v-icon>申請
        </v-btn>
      </div>
    </div>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import firebase from 'firebase'

export default {
  mixins: [validationMixin],

  validations: {
    title: { required },
    purpose: { required }
  },

  data: () => ({
    title: '',
    purpose: '',
    amount: '',
    memo: '',
    requestDate: '',
    requestStatus: '',
    requestUserId: firebase.auth().currentUser.uid,
    requestUserEMail: firebase.auth().currentUser.email,
    displayName: ''
  }),

  created: function () {
    let self = this

    this.db = firebase.firestore() // dbインスタンスを初期化
    var today = new Date()
    this.requestDate = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2)

    // ログインユーザー名取得
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        self.displayName = user.displayName
      }
    })
  },

  computed: {
    titleErrors () {
      const errors = []
      if (!this.$v.title.$dirty) return errors
      !this.$v.title.required && errors.push('書籍名は必須です')
      return errors
    },
    purposeErrors () {
      const errors = []
      if (!this.$v.purpose.$dirty) return errors
      !this.$v.purpose.required && errors.push('購入する目的は必須です')
      return errors
    }

  },

  methods: {
    submit () {
      // validation発火
      this.$v.$touch()
      // validationに引っかかってるか検査
      if (this.$v.$invalid) return

      // 申請データ登録
      let self = this
      // 「requests」というコレクションに対して {} で定義した情報を add する
      let collection = this.db.collection('requests')
      collection.add({
        title: this.title,
        purpose: this.purpose,
        amount: this.amount,
        memo: this.memo,
        requestStatus: '申請中',
        requestDate: this.requestDate,
        requestUserId: this.requestUserId,
        requestUserEMail: this.requestUserEMail,
        requester: this.displayName
      }).then(function (docRef) {
        // 保存に成功した時
        console.log('Document written with ID: ', docRef.id)
        self.requestStatus = '申請中'

        // メール送信処理
        self.sendMail()

        // 詳細画面に遷移
        self.$router.push({ name: 'RequestDetail', params: { id: docRef.id } })
      }).catch(function (error) {
        // 保存に失敗した時
        console.error('Error adding document: ', error)
      })
    },
    sendMail () {
      const sendMail = firebase.app().functions('asia-northeast1').httpsCallable('sendMail')
      sendMail({ destination: this.requestUserEMail, requestStatus: this.requestStatus, userName: this.displayName }).then(res => {
        console.log(res)
      }).catch(e => {
        console.log(e)
      })
    }
  }
}
</script>

<style scoped>
.btn {
  width: 30vw;
  max-width: 150px;
  min-width: 100px;
}
</style>
