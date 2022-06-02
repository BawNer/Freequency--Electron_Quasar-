<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4">
        <q-table
          title="Исходные данные"
          :rows="rowsDefaultData"
          :columns="columnsDefaultData"
          row-key="name"
          hide-bottom
          separator="cell"
          :pagination="{rowsPerPage: 0}"
          dense
        >
          <template v-slot:top-right>
            <q-btn
              label="Изменить данные"
              no-caps
              flat
              color="primary"
              @click="dataDialog = true"
            ></q-btn>
          </template>
        </q-table>
      </div>
      <div class="col-8">
        <q-table
          title="Результаты вычислений"
          :rows="rowsComputedData"
          :columns="columnsComputedData"
          row-key="name"
          hide-bottom
          separator="cell"
          :pagination="{rowsPerPage: 0}"
          dense
        ></q-table>
      </div>
    </div>

    <q-dialog
      v-model="dataDialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-bar class="bg-dark text-white">
          <q-space />

          <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
            <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary">Maximize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <div class="text-h6">Внесение изменений в исходные данные</div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-sm">
          <div class="col-4">
            <q-input
              type="number"
              v-model="_r0"
              outlined
              label="r0"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_nf"
              outlined
              label="nf"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_N"
              outlined
              label="N"
            ></q-input>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-space></q-space>
          <q-btn
            @click="saveProperty"
            v-close-popup
            color="primary">Сохранить</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useQuasar } from "quasar";

const columnsDefaultData = [
  { name: 'var', field: 'var', label: 'Переменная', align: 'left' },
  { name: 'val', field: 'val', label: 'Значение', align: 'left' },
  { name: 'ext', field: 'ext', label: 'Единица измерения', align: 'left' },
]

const columnsComputedData = [
  { name: 'var', field: 'var', label: 'Переменная', align: 'left' },
  { name: 'val', field: 'val', label: 'Вычисления', align: 'left' },
  { name: 'ext', field: 'ext', label: 'Единица измерения', align: 'left' },
]

export default {
  setup() {
    const dataDialog = ref(false)
    const maximizedToggle = ref(true)
    const $q = useQuasar()

    const firebase = inject('firebase')

    const r0 = ref(0)
    const nf = ref(0)
    const N = ref(0)
    const _r0 = ref(0)
    const _nf = ref(0)
    const _N = ref(0)
    const d = computed(() => Math.sqrt(3*N.value) * r0.value)
    const qsqrt= computed(() => Math.sqrt(3*N.value))
    const q = computed(() => d.value / r0.value)

    const rowsDefaultData = computed(() => [
      { var: 'RO', val: r0.value, ext: 'км' },
      { var: 'nf', val: nf.value, ext: '' },
      { var: 'N', val: N.value, ext: '' },
      { var: 'd', val: d.value, ext: '' },
      { var: 'q', val: qsqrt.value, ext: '' },
      { var: 'q', val: q.value, ext: '' }
    ])

    const r1 = computed(() => (q.value - 1) * r0.value)
    const r2 = computed(() => Math.sqrt(q.value**2 - q.value+1) * r0.value)
    const r3 = computed(() => Math.sqrt(q.value**2 + q.value+1) * r0.value)
    const r4 = computed(() => (q.value + 1) * r0.value)
    const r5 = computed(() => r3.value)
    const r6 = computed(() => r2.value)

    const sir = computed(() => 10*Math.log10((r0.value**(-nf.value))/((r1.value**(-nf.value))+(r2.value**(-nf.value))+(r3.value**(-nf.value))+(r4.value**(-nf.value))+(r5.value**(-nf.value))+(r6.value**(-nf.value)))))

    const rowsComputedData = computed(() => [
      { var: 'R1', val: r1.value },
      { var: 'R2', val: r2.value },
      { var: 'R3', val: r3.value },
      { var: 'R4', val: r4.value },
      { var: 'R5', val: r5.value },
      { var: 'R6', val: r6.value },
      { var: 'SIR', val: sir.value, ext: 'дБ' }
    ])

    const saveProperty = () => {
      r0.value = _r0.value
      nf.value = _nf.value
      N.value = _N.value
      $q.notify({
        message: 'Обновлено!',
        type: 'positive'
      })
    }

    onMounted(() => {
      firebase('noize').then(snapshot => {
        r0.value = _r0.value = snapshot.r0
        nf.value = _nf.value = snapshot.nf
        N.value = _N.value = snapshot.N
        saveProperty()
      }).catch(error => {
        $q.notify({
          message: error.message,
          type: 'negative'
        })
      })
    })

    return {
      columnsDefaultData,
      rowsDefaultData,
      columnsComputedData,
      rowsComputedData,
      dataDialog,
      maximizedToggle,
      _r0,
      _nf,
      _N,
      saveProperty
    }
  },
}
</script>
