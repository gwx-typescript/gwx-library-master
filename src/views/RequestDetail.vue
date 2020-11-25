<template>
  <div class="Datail">
    <form>
      <v-app-bar color="grey lighten-5" flat>
        <v-toolbar-title>
          <v-icon class="mr-2">menu_book</v-icon>購入申請詳細
        </v-toolbar-title>
      </v-app-bar>
      <div class="mx-10">
        <v-text-field
          v-model="title"
          :error-messages="titleErrors"
          required
          @input="$v.title.$touch()"
          @blur="$v.title.$touch()"
          label="書籍名"
          class="mt-4"
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
        <v-text-field v-model="amount" label="金額" class="mt-2" type="number"></v-text-field>
        <v-text-field v-model="memo" label="メモ" class="mt-2"></v-text-field>
        <v-text-field v-model="requestDate" label="申請日" class="mt-2" disabled></v-text-field>
        <v-text-field v-model="requester" label="申請者" class="mt-2" disabled></v-text-field>
        <v-text-field v-model="requestStatus" label="申請ステータス" class="mt-2" disabled></v-text-field>

        <!-- ボタン -->
        <div class="mt-8">
          <v-btn
            v-bind:disabled="this.$v.$invalid"
            class="btn mr-4 pa-1"
            @click="updateBook()"
            color="primary"
          >
            <v-icon class="mr-2">update</v-icon>更新
          </v-btn>

          <!-- 管理者のみ表示 -->
          <template v-if="adminFlg">
            <v-btn class="btn mr-4 my-4 pa-1" @click="updateBook('承認済')" color="success">
              <v-icon class="mr-2">thumb_up_alt</v-icon>承認
            </v-btn>
            <v-btn class="btn mr-4 my-4 pa-1" @click="updateBook('却下')" color="secondary">
              <v-icon class="mr-2">block</v-icon>却下
            </v-btn>
          </template>

          <v-btn class="btn my-4 pa-1" @click="deleteBook" color="error">
            <v-icon class="mr-2">delete</v-icon>削除
          </v-btn>
        </div>
      </div>
    </form>

    <!-- snackbar（画面下部に表示する通知） -->
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
      <v-btn color="pink" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import firebase from 'firebase'

export default {
  name: 'RequestDetail',

  mixins: [validationMixin],

  validations: {
    title: { required },
    purpose: { required }
  },
  data: () => ({
    id: '',
    title: '',
    purpose: '',
    requestStatus: '',
    requester: '',
    amount: '',
    memo: '',
    requestDate: '',
    requestUserId: '',
    requestUserEMail: '',
    email: firebase.auth().currentUser.email,
    adminFlg: '',
    snackbar: false,
    snackbarText: ''
  }),

  created: function () {
    this.db = firebase.firestore() // dbインスタンスを初期化
    this.id = this.$route.params['id']
    if (this.id) {
      this.getRequestData(this.id)
    } else {
      this.$router.push({ name: 'RequestList' })
    }
    this.getCurrentUser()
  },

  computed: {
    titleErrors () {
      const errors = []

      if (this.$v.title.$dirty) {
        !this.$v.title.required && errors.push('書籍名は必須です')
      }

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
    // 1件だけ取得する
    getRequestData: function (id) {
      let self = this
      // 直前に保存したデータを1件取得
      let collection = this.db.collection('requests')
      let docRef = collection.doc(id)
      docRef.get().then(function (doc) {
        if (doc.exists) {
          console.log('Document data:', doc.data())
          self.title = doc.data().title
          self.purpose = doc.data().purpose
          self.amount = doc.data().amount
          self.requestStatus = doc.data().requestStatus
          self.requester = doc.data().requester
          self.requestDate = doc.data().requestDate
          self.requestUserId = doc.data().requestUserId
          self.requestUserEMail = doc.data().requestUserEMail
          self.memo = doc.data().memo
        } else {
          console.log('No such document!')
        }
      }).catch(function (error) {
        console.log('Error getting document:', error)
      })
    },
    // 書籍データ更新
    updateBook (requestStatus) {
      // validation発火
      this.$v.$touch()
      // validationに引っかかってるか検査
      if (this.$v.$invalid) return

      // 承認 or 却下処理
      if (requestStatus) this.requestStatus = requestStatus

      let self = this
      // 「requests」というコレクションの「requests.id」に対して {} で定義した情報を set する
      let docRef = self.db.collection('requests').doc(self.id)
      docRef.set({
        title: self.title ? self.title : '',
        purpose: self.purpose ? self.purpose : '',
        amount: self.amount ? self.amount : '',
        requestStatus: self.requestStatus ? self.requestStatus : '',
        memo: self.memo ? self.memo : ''
      }, { merge: true }
      ).then(function (docRef) {
        console.log('Document set with ID: ', self.id)

        // メール送信処理
        self.sendMail()

        // 詳細画面に遷移
        self.$router.push({ name: 'RequestDetail', params: { id: self.id } })
          .catch(err => {
            console.log(err)
          })
        self.snackbar = true
        self.snackbarText = '更新しました'
      }).catch(function (error) {
        console.error('Error adding document: ', error)
      })
    },
    // 書籍データ削除
    deleteBook () {
      if (!confirm('削除してもよろしいですか？')) return

      let self = this
      self.db.collection('requests').doc(self.id).delete().then(function () {
        console.log('Document successfully deleted!')
        self.snackbar = true
        self.snackbarText = '削除しました'
        self.$router.push({ name: 'RequestList' })
      }).catch(function (error) {
        console.error('Error removing document: ', error)
      })
    },
    sendMail () {
      const sendMail = firebase.app().functions('asia-northeast1').httpsCallable('sendMail')
      sendMail({ destination: this.requestUserEMail, requestStatus: this.requestStatus, title: this.title }).then(res => {
        console.log(res)
      }).catch(e => {
        console.log(e)
      })
    },
    getCurrentUser () {
      try {
        let self = this
        // ユーザー情報取得
        let collection = self.db.collection('users')
        collection.where('email', '==', self.email).get().then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.adminFlg = doc.data().adminFlg
          })
        }).catch(function (error) {
          console.log('Error getting document:', error)
        })
      } catch (error) {
        console.log(error)
      }
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
.error-msg {
  color: #ff5252 !important;
  font-size: 12px;
}
</style>
