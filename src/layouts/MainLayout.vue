<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <q-bar class="q-electron-drag bg-grey-10 text-grey-11">
        <q-icon name="map" class="q-electron-drag--exception" />

        <div>Дипломная работа</div>
        <q-space />
        <div>{{router.currentRoute.value.meta.name}}</div>
        <q-space />
        <q-btn color="primary" dense flat icon="minimize" @click="onWindowMinimize" />
        <q-btn dense flat icon="crop_square" @click="onWindowMaximize" />
        <q-btn color="red" dense flat icon="close" @click="onWindowClose" />
      </q-bar>
    </q-header>

    <q-drawer
      bordered
      elevated
      show-if-above
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
    >
      <q-list>
        <q-item-label
          header
        >
          Модели расчетов
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Модель Окамуры',
    caption: 'Проведение расчетов',
    icon: 'mdi-globe-model',
    link: '/okamura'
  },
  {
    title: 'Модель Ли',
    caption: 'Проведение расчетов',
    icon: 'mdi-globe-model',
    link: '/li'
  },
  {
    title: 'Модель Хата',
    caption: 'Проведение расчетов',
    icon: 'mdi-globe-model',
    link: '/hata'
  },
  {
    title: 'Межсотовые помехи',
    caption: 'Проведение расчетов',
    icon: 'mdi-antenna',
    link: '/noize'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const router = useRouter()

    const miniState = ref(true)
    const onWindowMinimize = () => {
      if (process.env.MODE === 'electron') {
        window.myWindowAPI.minimize()
      }
    }
    const onWindowMaximize = () => {
      if (process.env.MODE === 'electron') {
        window.myWindowAPI.toggleMaximize()
      }
    }
    const onWindowClose = () => {
      if (process.env.MODE === 'electron') {
        window.myWindowAPI.close()
      }
    }

    return {
      essentialLinks: linksList,
      onWindowMinimize,
      onWindowMaximize,
      onWindowClose,
      miniState,
      router
    }
  }
})
</script>
