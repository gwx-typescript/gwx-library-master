<template>
  <div id="form">
    <v-app-bar color="grey lighten-5" flat>
      <v-toolbar-title>
        <v-icon class="mr-2">list_alt</v-icon>書籍一覧
      </v-toolbar-title>
    </v-app-bar>
    <v-form v-resize="onResize">
      <v-container fluid class="pa-1">
        <v-row class="px-2">
          <v-col cols="6" class="pa-1 ml-4">
            <v-spacer></v-spacer>
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
          <router-link :to="{ name: 'Detail', params: { id: item.id } }">{{ item.title }}</router-link>
        </template>
        <template v-slot:item.borrowStatus="{ item }">
          <v-icon v-if="item.borrowStatus === '貸出可能'" color="green">check_circle_outline</v-icon>
        </template>
        <template v-slot:item.action="{ item }">
          <v-btn
            small
            class="mx-1"
            color="info"
            :to="{ name: 'Detail', params: { id: item.id } }"
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
      { text: '貸出可能', align: 'center', sortable: true, value: 'borrowStatus' },
      { text: '借りている人', align: 'center', sortable: true, value: 'borrower' },
      { text: '貸出日', align: 'center', sortable: true, value: 'checkoutDate' },
      { text: '登録日', align: 'center', sortable: true, value: 'registerDate' },
      { text: 'メモ', align: 'center', sortable: true, value: 'memo' },
      { text: '', align: 'center', sortable: false, value: 'action' }
    ],
    items: [],
    total: 0,
    search: '',
    snackbar: false,
    snackbarText: ''
  }),

  created: function () {
    this.db = firebase.firestore() // dbインスタンスを初期化
    this.loadList()
  },

  methods: {
    async loadList () {
      this.isLoading = true
      try {
        let self = this
        self.items = []
        // 全件取得
        let collection = self.db.collection('books')
        collection.get().then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.items.push({
              title: doc.data().title,
              borrowStatus: doc.data().borrowStatus,
              borrower: doc.data().borrower,
              registerDate: doc.data().registerDate,
              checkoutDate: doc.data().checkoutDate,
              memo: doc.data().memo,
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
    onResize () {
      if (window.innerWidth < 769) { this.isMobile = true } else { this.isMobile = false }
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
