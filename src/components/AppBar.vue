<template>
  <div>
    <template v-if="$route.path != '/signin' && $route.path != '/signup'">
      <v-navigation-drawer v-model="drawer" clipped app fixed>
        <v-list>
          <v-list-item-group active-class="text--accent-4">
            <router-link to="/mypage">
              <v-list-item class="my-1">
                <v-icon class="mr-2">home</v-icon>
                <v-list-item-title>マイページ</v-list-item-title>
              </v-list-item>
            </router-link>
            <v-divider></v-divider>
            <router-link to="/">
              <v-list-item class="my-1">
                <v-icon class="mr-2">list_alt</v-icon>
                <v-list-item-title>書籍一覧</v-list-item-title>
              </v-list-item>
            </router-link>
            <v-divider></v-divider>
            <router-link to="/requestList">
              <v-list-item class="my-1">
                <v-icon class="mr-2">list_alt</v-icon>
                <v-list-item-title>購入申請一覧</v-list-item-title>
              </v-list-item>
            </router-link>
            <v-divider></v-divider>
            <router-link to="/requestPurchase">
              <v-list-item class="my-1">
                <v-icon class="mr-2">how_to_vote</v-icon>
                <v-list-item-title>購入申請</v-list-item-title>
              </v-list-item>
            </router-link>
            <v-divider></v-divider>
            <router-link @click.native="signout" to="/">
              <v-list-item>
                <v-icon class="mr-2">exit_to_app</v-icon>
                <v-list-item-title>ログアウト</v-list-item-title>
              </v-list-item>
            </router-link>
            <v-divider></v-divider>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-app-bar app color="primary" dark clipped-left fixed>
      <v-app-bar-nav-icon @click="drawer=!drawer"></v-app-bar-nav-icon>
      <router-link to="/" tag="div">
        <v-toolbar-title color="Black" class="title">GWX Library</v-toolbar-title>
      </router-link>
      <!-- ログイン済み、PCの場合のみログインユーザー名を表示 -->
      <template
        v-if="$route.path != '/signin' && $route.path != '/signup' && !$vuetify.breakpoint.xs && displayName"
      >
        <v-spacer />
        <v-toolbar-title color="Black" class="title">ようこそ、 {{displayName}} さん</v-toolbar-title>
      </template>
    </v-app-bar>

    <v-app-bar app color="primary" dense dark bottom clipped-left>
      <v-spacer />
      <v-toolbar-title color="Black">© 2020 GlobalWorks Corp.</v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
      <v-btn color="pink" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  data () {
    return {
      drawer: null,
      snackbar: false,
      snackbarText: '',
      displayName: ''
    }
  },
  created () {
    let self = this

    // ログインユーザー名取得
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        self.displayName = user.displayName
      }
    })
  },
  methods: {
    // ログアウト処理
    signout () {
      let self = this

      firebase.auth().signOut().then(() => {
        self.snackbar = true
        self.snackbarText = 'ログアウトしました'
        console.log(`ログアウトしました`)
        self.$router.push({ name: 'Signin' })
          .catch(err => {
            console.log(err)
          })
      })
        .catch((error) => {
          console.log(`ログアウト時にエラーが発生しました (${error})`)
        })
    }
  }
}
</script>

<style scoped>
a {
  color: white;
  text-decoration: none;
}
</style>
