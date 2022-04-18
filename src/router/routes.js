
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/okamura',
    children: [
      { path: 'okamura', meta: { name: 'Модель Окамуры' }, component: () => import('src/pages/ModelOkamura.vue') },
      { path: 'li', meta: { name: 'Модель Ли' }, component: () => import('src/pages/ModelLi.vue') },
      { path: 'hata', meta: { name: 'Модель Хата' }, component: () => import('src/pages/ModelHata.vue') },
      { path: 'noize', meta: { name: 'Межсотовые помехи' }, component: () => import('src/pages/Noize.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
