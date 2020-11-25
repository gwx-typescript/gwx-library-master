<template>
  <div id="form">
    <v-app-bar color="grey lighten-5" flat>
      <v-toolbar-title>
        <v-icon class="mr-2">list_alt</v-icon>購入申請一覧
      </v-toolbar-title>
    </v-app-bar>
    <v-form v-resize="onResize">
      <v-container class="pa-1">
        <v-row class="px-2">
          <v-col xs="12" sm="6" md="4" lg="3" class="pa-1 ml-4">
            <v-text-field
              prepend-inner-icon="search"
              clearable
              label="検索"
              name="title"
              maxlength="64"
              v-model="search"
              @change="loadList"
            ></v-text-field>
          </v-col>
          <v-col xs="12" sm="6" md="4" lg="3" class="pa-1 ml-4">
            <v-spacer></v-spacer>
            <v-select :items="requestStatus" label="申請ステータス" v-model="search"></v-select>
          </v-col>
        </v-row>
      </v-container>
      <v-data-table
        :headers="headers"
        :items="items"
        :hide-default-header="isMobile"
        :class="{mobile: isMobile}"
        :search="search"
        must-sort
      >
        <template v-slot:item.title="{ item }">
          <router-link :to="{ name: 'RequestDetail', params: { id: item.id } }">{{ item.title }}</router-link>
        </template>
        <template v-slot:item.action="{ item }">
          <template v-if="item.requestStatus === '承認済'">
            <v-btn small class="mx-1" color="success" @click="registerBook(item)">登録</v-btn>
          </template>
          <v-btn
            small
            class="mx-1"
            color="info"
            :to="{ name: 'RequestDetail', params: { id: item.id } }"
          >詳細</v-btn>
        </template>
      </v-data-table>
    </v-form>
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
      <v-btn color="pink" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  data: () => ({
    isLoading: false,
    isMobile: false,
    sortBy: 'title',
    headers: [
      { text: '書籍名', align: 'center', sortable: true, value: 'title' },
      { text: '申請した人', align: 'center', sortable: true, value: 'requester' },
      { text: '申請ステータス', align: 'center', sortable: true, value: 'requestStatus' },
      { text: '目的', align: 'center', sortable: true, value: 'purpose' },
      { text: '申請日', align: 'center', sortable: true, value: 'requestDate' },
      { text: '金額', align: 'center', sortable: true, value: 'amount' },
      { text: 'メモ', align: 'center', sortable: true, value: 'memo' },
      { text: '', align: 'center', sortable: false, value: 'action' }
    ],
    items: [],
    requestStatus: ['申請中', '承認済', '却下', '登録済'],
    total: 0,
    search: '',
    snackbar: false,
    snackbarText: '',
    requestUserId: firebase.auth().currentUser.uid,
    registerDate: '',
    email: firebase.auth().currentUser.email,
    adminFlg: false
  }),

  created: function () {
    this.db = firebase.firestore() // dbインスタンスを初期化
    this.getCurrentUser()
    var today = new Date()
    this.registerDate = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2)
  },

  methods: {
    loadList () {
      this.isLoading = true
      try {
        let self = this
        self.items = []
        // 申請情報取得
        let collection = self.db.collection('requests')
        // 管理者の場合、全件取得
        if (!self.adminFlg) {
          collection = collection.where('requestUserId', '==', self.requestUserId)
        }
        collection.get().then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.items.push({
              title: doc.data().title,
              purpose: doc.data().purpose,
              requestStatus: doc.data().requestStatus,
              requester: doc.data().requester,
              requestDate: doc.data().requestDate,
              amount: doc.data().amount,
              memo: doc.data().memo,
              requestUserId: doc.data().requestUserId,
              id: doc.id
            })
          })
          console.log('items => ', self.items)
        }).catch(function (error) {
          console.log('Error getting document:', error)
        })
      } catch (error) {
        console.log('情報を取得できませんでした。時間をおいてやり直してください。')
      }
      this.isLoading = false
    },

    // 書籍データ登録
    registerBook (item) {
      let self = this
      // 書籍情報登録処理
      let booksCollection = self.db.collection('books')
      booksCollection.add({
        title: item.title,
        requestUserId: self.requestUserId,
        borrowStatus: '貸出可能',
        registerDate: self.registerDate
      }).then(function (docRef) {
        // 保存に成功した時
        console.log('Document written with ID: ', docRef.id)

        // 申請ステータス更新処理
        let requestsDocRef = self.db.collection('requests').doc(item.id)
        requestsDocRef.set({
          requestStatus: '登録済'
        }, { merge: true }
        ).then(function () {
          // 保存に成功した時
          console.log('Document written with ID: ', item.id)
          // 申請一覧画面に遷移
          self.$router.go({ path: self.$router.currentRoute.path, force: true })
        }).catch(function (error) {
          // 保存に失敗した時
          console.error('Error update document: ', error)
        })
      }).catch(function (error) {
        // 保存に失敗した時
        console.error('Error adding document: ', error)
      })
    },

    onResize () {
      if (window.innerWidth < 769) { this.isMobile = true } else { this.isMobile = false }
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
          self.loadList()
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

<style>
a {
  color: white;
  text-decoration: none;
}
.v-data-table__mobile-row__cell {
  padding: 10px;
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-data-table th,
.v-data-table td {
  max-width: 375px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile {
  color: #333;
}

@media screen and (max-width: 768px) {
  .mobile table tr {
    max-width: 100%;
    position: relative;
    display: block;
  }

  .mobile table tr:nth-child(odd) {
    border-left: 6px solid deeppink;
  }

  .mobile table tr:nth-child(even) {
    border-left: 6px solid cyan;
  }

  .mobile table tr td {
    display: flex;
    width: 100%;
    border-bottom: 1px solid #f5f5f5;
    height: auto;
    padding: 10px;
  }

  .mobile table tr td ul li:before {
    content: attr(data-label);
    padding-right: 0.5em;
    text-align: left;
    display: block;
    color: #999;
  }
  .v-datatable__actions__select {
    width: 50%;
    margin: 0px;
    justify-content: flex-start;
  }
  .mobile .theme--light.v-table tbody tr:hover:not(.v-datatable__expand-row) {
    background: transparent;
  }
}
.flex-content {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.flex-item {
  padding: 5px;
  width: 50%;
  height: 40px;
  font-weight: bold;
}
</style>
