<template>
  <div>
    <v-app-bar color="grey lighten-5" flat>
      <v-toolbar-title>
        <v-icon class="mr-2">home</v-icon>マイページ
      </v-toolbar-title>
    </v-app-bar>
    <v-container>
      <!-- 管理者のみ表示 -->
      <v-btn
        v-if="adminFlg"
        class="mx-5 my-3 pa-2"
        :to="{ name: 'Administration' }"
        color="gray"
        large
      >
        <v-icon class="mr-2">build</v-icon>管理サイトを開く
      </v-btn>

      <v-card class="ma-5 pa-2">
        <v-card-title>
          <v-icon class="mr-2">list_alt</v-icon>貸出一覧
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="ma-2" v-if="!borrowedItems.length" v-text="'貸出中の書籍はありません'"></v-card-text>
        <v-list v-for="item in borrowedItems" v-bind:key="item.id">
          <v-list-item-group active-class="text--accent-4">
            <router-link :to="{ name: 'Detail', params: { id: item.id } }">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.checkoutDate"></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </router-link>
            <v-divider></v-divider>
          </v-list-item-group>
        </v-list>
      </v-card>

      <v-card class="ma-5 pa-2">
        <v-card-title>
          <v-icon class="mr-2">list_alt</v-icon>申請一覧
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="ma-2" v-if="!requestItems.length" v-text="'申請中の書籍はありません'"></v-card-text>
        <v-list v-for="item in requestItems" v-bind:key="item.id">
          <v-list-item-group active-class="text--accent-4">
            <router-link :to="{ name: 'RequestDetail', params: { id: item.id } }">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.requestDate"></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </router-link>
            <v-divider></v-divider>
          </v-list-item-group>
        </v-list>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {

  data: () => ({
    currentUserId: firebase.auth().currentUser.uid,
    email: firebase.auth().currentUser.email,
    adminFlg: '',
    requestItems: [],
    borrowedItems: []
  }),

  created: function () {
    this.db = firebase.firestore() // dbインスタンスを初期化
    this.getCurrentUser()
    this.loadBorrowedList()
    this.loadRequestList()
  },

  methods: {
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
    },
    async loadRequestList () {
      try {
        let self = this
        self.requestItems = []
        // 全件取得
        let collection = self.db.collection('requests')
        collection.where('requestUserId', '==', self.currentUserId).get().then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.requestItems.push({
              title: doc.data().title,
              requestDate: doc.data().requestDate,
              id: doc.id
            })
          })
        }).catch(function (error) {
          console.log('Error getting document:', error)
        })
      } catch (error) {
        console.log('情報を取得できませんでした。時間をおいてやり直してください。')
      }
    },
    async loadBorrowedList () {
      try {
        let self = this
        self.borrowedItems = []
        // 全件取得
        let collection = self.db.collection('books')
        collection.where('userId', '==', self.currentUserId).get().then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.borrowedItems.push({
              title: doc.data().title,
              checkoutDate: doc.data().checkoutDate,
              id: doc.id
            })
          })
        }).catch(function (error) {
          console.log('Error getting document:', error)
        })
      } catch (error) {
        console.log('情報を取得できませんでした。時間をおいてやり直してください。')
      }
    }
  }
}
</script>

<style scoped>
</style>
