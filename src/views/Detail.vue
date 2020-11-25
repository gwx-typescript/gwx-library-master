<template>
  <div class="Datail">
    <form>
      <v-app-bar color="grey lighten-5" flat>
        <v-toolbar-title>
          <v-icon class="mr-2">menu_book</v-icon>書籍詳細
        </v-toolbar-title>
      </v-app-bar>
      <div class="mx-10">
        <template v-if="borrowStatus === '貸出中'">
          <span class="error-msg">この本は貸出中です。</span>
          <br />
        </template>

        <v-btn
          v-bind:disabled="borrowStatus === '貸出中'"
          class="my-2 py-1 px-5"
          @click="borrowBook"
          color="success"
          fluid
        >
          <v-icon class="mr-2">check_circle_outline</v-icon>この本を借りる
        </v-btn>

        <v-btn
          v-bind:disabled="borrowStatus === '貸出可能' || borrower !== displayName"
          class="my-2 ml-2 py-1 px-5"
          @click="returnBook"
          color="success"
          fluid
        >
          <v-icon class="mr-2">check_circle_outline</v-icon>この本を返却する
        </v-btn>

        <v-text-field
          v-model="title"
          :error-messages="titleErrors"
          required
          @input="$v.title.$touch()"
          @blur="$v.title.$touch()"
          label="書籍名"
          class="mt-4"
        ></v-text-field>
        <v-text-field v-model="borrowStatus" label="貸出ステータス" class="mt-2" disabled></v-text-field>
        <v-text-field
          v-model="borrower"
          :error-messages="borrowerErrors"
          @change="$v.borrower.$touch()"
          @blur="$v.borrower.$touch()"
          label="借りている人"
          class="mb-2"
          disabled
        ></v-text-field>
        <label>貸出日</label>
        <br />
        <template v-if="checkoutDateError">
          <span class="error-msg">{{checkoutDateError}}</span>
          <br />
        </template>
        <template v-if="borrower && !checkoutDate">
          <span class="error-msg">借りている人が入力されています。貸出日を選択して下さい。</span>
          <br />
        </template>

        <v-date-picker
          v-model="checkoutDate"
          @change="$v.checkoutDate.$touch();validateCheckoutDate();borrowerErrors"
          @blur="$v.borrower.$touch()"
          label="貸出日"
          :reactive="true"
          locale="ja-jp"
          :day-format="date => new Date(date).getDate()"
          class="mt-2"
        ></v-date-picker>
        <v-text-field v-model="memo" label="メモ" class="mt-4"></v-text-field>

        <!-- ボタン -->
        <div class="mt-8">
          <v-btn
            v-bind:disabled="this.$v.$invalid || checkoutDateError != '' || borrowerErrors != ''"
            class="btn mr-4 pa-1"
            @click="updateBook"
            color="primary"
          >
            <v-icon class="mr-2">update</v-icon>更新
          </v-btn>
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
  name: 'Datail',

  mixins: [validationMixin],

  validations: {
    title: { required },
    borrower: {},
    checkoutDate: {}
  },
  data: () => ({
    id: '',
    title: '',
    borrowStatus: '',
    borrower: '',
    checkoutDate: '',
    memo: '',
    snackbar: false,
    snackbarText: '',
    checkoutDateError: '',
    displayName: ''
  }),

  created: function () {
    let self = this
    this.db = firebase.firestore() // dbインスタンスを初期化

    // 書籍のIDがあれば取得、なければ一覧画面に遷移
    this.id = this.$route.params['id']
    if (this.id) {
      this.getBookData(this.id)
    } else {
      this.$router.push({ name: 'List' })
    }

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

      if (this.$v.title.$dirty) {
        !this.$v.title.required && errors.push('書籍名は必須です')
      }

      return errors
    },
    borrowerErrors () {
      const errors = []

      if (this.$v.borrower.$dirty || this.$v.checkoutDate.$dirty) {
        if (!this.borrower && this.checkoutDate) {
          errors.push('貸出日が入力されています。借りている人を選択して下さい。')
        }
      }

      return errors
    }
  },

  methods: {
    // 1件だけ取得する
    getBookData: function (id) {
      let self = this
      // 直前に保存したデータを1件取得
      let collection = this.db.collection('books')
      let docRef = collection.doc(id)
      docRef.get().then(function (doc) {
        if (doc.exists) {
          console.log('Document data:', doc.data())
          self.title = doc.data().title
          self.borrowStatus = doc.data().borrowStatus
          self.borrower = doc.data().borrower
          self.checkoutDate = doc.data().checkoutDate
          self.memo = doc.data().memo
        } else {
          console.log('No such document!')
        }
      }).catch(function (error) {
        console.log('Error getting document:', error)
      })
    },
    // 貸出処理
    borrowBook () {
      let self = this
      // 「books」というコレクションの「bookData.id」に対して {} で定義した情報を set する
      let docRef = self.db.collection('books').doc(self.id)
      docRef.set({
        borrower: self.displayName,
        borrowStatus: '貸出中'
      }, { merge: true }
      ).then(function (docRef) {
        console.log('Document set with ID: ', self.id)
        // 詳細画面に遷移
        self.$router.push({ name: 'Detail', params: { id: self.id } })
          .catch(err => {
            console.log(err)
          })
        // 画面反映
        self.borrower = self.displayName
        self.borrowStatus = '貸出中'
        // スナックバー表示
        self.snackbar = true
        self.snackbarText = self.title + 'の貸出が完了しました'
      }).catch(function (error) {
        console.error('Error update document: ', error)
      })
    },
    // 返却処理
    returnBook () {
      let self = this
      // 「books」というコレクションの「bookData.id」に対して {} で定義した情報を set する
      let docRef = self.db.collection('books').doc(self.id)
      docRef.set({
        borrower: '',
        borrowStatus: '貸出可能'
      }, { merge: true }
      ).then(function (docRef) {
        console.log('Document set with ID: ', self.id)
        // 詳細画面に遷移
        self.$router.push({ name: 'Detail', params: { id: self.id } })
          .catch(err => {
            console.log(err)
          })
        // 画面反映
        self.borrower = ''
        self.borrowStatus = '貸出可能'
        // スナックバー表示
        self.snackbar = true
        self.snackbarText = self.title + 'の返却が完了しました'
      }).catch(function (error) {
        console.error('Error update document: ', error)
      })
    },
    // 書籍データ更新
    updateBook () {
      // validation発火
      this.$v.$touch()
      // validationに引っかかってるか検査
      if (this.$v.$invalid) return

      let self = this
      // 「books」というコレクションの「bookData.id」に対して {} で定義した情報を set する
      let docRef = self.db.collection('books').doc(self.id)
      docRef.set({
        title: self.title ? self.title : '',
        borrower: self.borrower ? self.borrower : '',
        checkoutDate: self.checkoutDate ? self.checkoutDate : '',
        memo: self.memo ? self.memo : ''
      }, { merge: true }
      ).then(function (docRef) {
        console.log('Document set with ID: ', self.id)
        // 詳細画面に遷移
        self.$router.push({ name: 'Detail', params: { id: self.id } })
          .catch(err => {
            console.log(err)
          })
        self.snackbar = true
        self.snackbarText = '更新しました'
      }).catch(function (error) {
        console.error('Error update document: ', error)
      })
    },
    // 書籍データ削除
    deleteBook () {
      if (!confirm('削除してもよろしいですか？')) return

      let self = this
      self.db.collection('books').doc(self.id).delete().then(function () {
        console.log('Document successfully deleted!')
        self.snackbar = true
        self.snackbarText = '削除しました'
        self.$router.push({ name: 'List' })
      }).catch(function (error) {
        console.error('Error removing document: ', error)
      })
    },
    validateCheckoutDate () {
      var dt = new Date()
      var y = dt.getFullYear()
      var m = ('00' + (dt.getMonth() + 1)).slice(-2)
      var d = ('00' + dt.getDate()).slice(-2)
      var nowDate = y + '-' + m + '-' + d

      if (this.checkoutDate > nowDate) {
        this.checkoutDateError = '未来の日付は選択できません'
      } else {
        this.checkoutDateError = ''
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
