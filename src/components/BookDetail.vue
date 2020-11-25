<template>
  <form class="mx-10">
    <h1 class="my-4">書籍詳細</h1>
    <v-text-field
      v-model="title"
      :error-messages="titleErrors"
      label="書籍名"
      required
      @input="$v.title.$touch()"
      @blur="$v.title.$touch()"
      class="mt-4"
    ></v-text-field>
    <v-text-field v-model="borrower" label="借りている人" class="mb-4"></v-text-field>
    <label>貸出日</label>
    <br />
    <v-date-picker
      v-model="checkoutDate"
      label="貸出日"
      :landscape="true"
      :reactive="true"
      locale="ja-jp"
      :day-format="date => new Date(date).getDate()"
      class="mt-2"
    ></v-date-picker>
    <div class="mt-4">
      <v-btn class="mr-4" @click="submit" color="primary">更新</v-btn>
      <v-btn @click="clear">削除</v-btn>
    </div>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import firebase from 'firebase'

export default {
  props: {
    bookData: Object
  },

  mixins: [validationMixin],

  validations: {
    title: { required }
  },

  data: function () {
    return {
      id: this.$props.bookData.id,
      title: this.$props.bookData.title,
      borrower: this.$props.bookData.borrower,
      checkoutDate: this.$props.bookData.borrower
    }
  },
  created: function () {
    this.db = firebase.firestore() // dbインスタンスを初期化
  },

  mounted: function () {
    this.id = this.$props.bookData.id
    this.title = this.$props.bookData.title
    this.borrower = this.$props.bookData.borrower
    this.checkoutDate = this.$props.bookData.checkoutDate
    console.log(this.$data)
  },

  computed: {
    titleErrors () {
      const errors = []
      if (!this.$v.title.$dirty) return errors
      !this.$v.title.required && errors.push('書籍名は必須です')
      return errors
    }
  },

  methods: {
    submit () {
      // validation発火
      this.$v.$touch()
      // validationに引っかかってるか検査
      if (this.$v.$invalid) return

      // 書籍データ登録
      let self = this
      // 「books」というコレクションの「bookData.id」に対して {} で定義した情報を update する
      let docRef = this.db.collection('books').doc(self.id)
      docRef.update({
        title: self.title
      }).then(function (docRef) {
        // 保存に成功した時
        console.log('Document written with ID: ', self.id)
        // 詳細画面に遷移
        // self.$router.go({ path: self.$router.currentRoute.path, force: true })
        self.$router.replace({ name: 'Detail', params: { id: self.id } })
      }).catch(function (error) {
        // 保存に失敗した時
        console.error('Error adding document: ', error)
      })
    },
    clear () {
      this.$v.$reset()
      this.title = ''
    }
  }

}
</script>
