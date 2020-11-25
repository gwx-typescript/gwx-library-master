<template>
  <div>
    <v-app-bar color="grey lighten-5" flat>
      <v-toolbar-title>
        <v-icon class="mr-2">build</v-icon>管理サイト
      </v-toolbar-title>
    </v-app-bar>
    <v-container>
      <v-card class="ma-5 pa-2">
        <v-card-title>
          <v-icon class="mr-2">list_alt</v-icon>ユーザー一覧
        </v-card-title>
        <v-divider></v-divider>
        <v-list v-for="user in userList" v-bind:key="user.id">
          <v-list-item-group active-class="text--accent-4">
            <v-list-item>
              <v-icon v-if="user.adminFlg" class="mr-2">build</v-icon>
              <v-list-item-content>
                <v-list-item-title v-text="user.displayName"></v-list-item-title>
              </v-list-item-content>
              <v-btn v-bind:disabled="user.adminFlg" color="success" class="mr-2">管理者権限を付与する</v-btn>
              <v-btn color="error">削除</v-btn>
            </v-list-item>
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
    userList: []
  }),

  created: function () {
    this.db = firebase.firestore() // dbインスタンスを初期化
    this.getListAllUsers()
  },

  methods: {
    async getListAllUsers () {
      try {
        let self = this
        // ユーザー情報取得
        let collection = self.db.collection('users')
        collection.orderBy('adminFlg', 'desc').get().then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.userList.push({
              email: doc.data().email,
              password: doc.data().password,
              displayName: doc.data().displayName,
              adminFlg: doc.data().adminFlg
            })
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
  max-width: 200px;
  min-width: 150px;
}
</style>
