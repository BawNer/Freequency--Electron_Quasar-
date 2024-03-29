<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
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
          <div class="col-12">
            <q-table
              title="Расстояние"
              :rows="[{va: 1, ed: 'км', am: 20},{va: 5, ed: 'км', am: 27},{va: 10, ed: 'км', am: 30},{va: 15, ed: 'км', am: 33},{va: 20, ed: 'км', am: 35},{va: 25, ed: 'км', am: 37},{va: 30, ed: 'км', am: 40}]"
              :columns="[{name: 'va', field: 'va', label: 'Значение', align: 'left'}, {name: 'ed', field: 'ed', label: 'Ед. измерения', align: 'left'}]"
              row-key="name"
              hide-bottom
              separator="cell"
              :pagination="{rowsPerPage: 0}"
              dense
            ></q-table>
          </div>
        </div>
      </div>
      <div class="col-8">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <canvas id="chart"></canvas>
          </div>
          <div class="col-12">
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
              v-model="_rbc"
              outlined
              label="Рбс (Вт)"
              hint="мощность передатчика БС в мВт"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_g1"
              outlined
              label="g1"
              hint="коэффициент усиления антенны БС в дБ"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_h1"
              outlined
              label="h1"
              hint="высота антенны в м"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_h2"
              outlined
              label="h2"
              hint="высота антенны в м"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_y"
              outlined
              label="Y"
              hint="мрад"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_dh"
              outlined
              label="dh"
              hint="м"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_f"
              outlined
              label="f"
              hint="рабочая частота, МГц"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_nL"
              outlined
              label="nL"
              hint="число"
            ></q-input>
          </div>
          <div class="col-4">
            <q-input
              type="number"
              v-model="_rbcDB"
              outlined
              label="Рбс (dB)"
              hint="мощность передатчика БС в дБ"
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
import { useQuasar } from 'quasar'
import { Chart, registerables } from 'chart.js';


const columnsDefaultData = [
  { name: 'per', field: 'per', label: 'Переменная', align: 'left' },
  { name: 'val', field: 'val', label: 'Значение', align: 'left' },
  { name: 'ed', field: 'ed', label: 'Измерение ед', align: 'left' },
]

const columnsComputedData = [
  { name: 'pm', field: 'pm', label: 'Pm', align: 'left' },
  { name: 'pmval', field: 'pmval', label: 'Значение', align: 'left' },
  { name: 'lrf', field: 'lrf', label: 'L(R,f)', align: 'left' },
  { name: 'lrfval', field: 'lrfval', label: 'Значение', align: 'left' },
]

export default {
  setup() {
    const $q = useQuasar()
    Chart.register(...registerables)

    const dataDialog = ref(false)
    const maximizedToggle = ref(true)

    const chart = ref(null)

    const rbc = ref(null)
    const g1 = ref(null)
    const h1 = ref(null)
    const h2 = ref(null)
    const y = ref(null)
    const dh = ref(null)
    const f = ref(null)
    const nL = ref(null)
    const rbcDB = ref(null)

    const _rbc = ref(null)
    const _g1 = ref(null)
    const _h1 = ref(null)
    const _h2 = ref(null)
    const _y = ref(null)
    const _dh = ref(null)
    const _f = ref(null)
    const _nL = ref(null)
    const _rbcDB = ref(null)

    const firebase = inject('firebase')

    const rowsDefaultData = computed(() => [
      { per: 'Рбс', val: rbc.value, ed: 'Вт' },
      { per: 'g1', val: g1.value, ed: 'дБ' },
      { per: 'h1', val: h1.value, ed: 'м' },
      { per: 'h2', val: h2.value, ed: 'м' },
      { per: 'Y', val: y.value, ed: 'мрад' },
      { per: 'dh', val: dh.value, ed: 'м' },
      { per: 'f', val: f.value, ed: 'МГц' },
      { per: 'nL', val: nL.value, ed: '' },
      { per: 'Рбс(dB)', val: rbcDB.value, ed: 'дБ' }
    ])

    const lrfval1 = computed(() => 69+26*Math.log10(f.value)-13.8*Math.log10(h1.value)+(44.9-6.5*Math.log10(h1.value))*Math.log10(1))
    const lrfval2 = computed(() => 69+26*Math.log10(f.value)-13.8*Math.log10(h1.value)+(44.9-6.5*Math.log10(h1.value))*Math.log10(5))
    const lrfval3 = computed(() => 69+26*Math.log10(f.value)-13.8*Math.log10(h1.value)+(44.9-6.5*Math.log10(h1.value))*Math.log10(10))
    const lrfval4 = computed(() => 69+26*Math.log10(f.value)-13.8*Math.log10(h1.value)+(44.9-6.5*Math.log10(h1.value))*Math.log10(15))
    const lrfval5 = computed(() => 69+26*Math.log10(f.value)-13.8*Math.log10(h1.value)+(44.9-6.5*Math.log10(h1.value))*Math.log10(20))
    const lrfval6 = computed(() => 69+26*Math.log10(f.value)-13.8*Math.log10(h1.value)+(44.9-6.5*Math.log10(h1.value))*Math.log10(25))
    const lrfval7 = computed(() => 69+26*Math.log10(f.value)-13.8*Math.log10(h1.value)+(44.9-6.5*Math.log10(h1.value))*Math.log10(30))

    const rowsComputedData = computed(() => [
      {
        pm: 1,
        pmval: rbcDB.value + g1.value - lrfval1.value,
        lrf: 1,
        lrfval: lrfval1.value
      },
      {
        pm: 2,
        pmval: rbcDB.value + g1.value - lrfval2.value,
        lrf: 2,
        lrfval: lrfval2.value
      },
      {
        pm: 3,
        pmval: rbcDB.value + g1.value - lrfval3.value,
        lrf: 3,
        lrfval: lrfval3.value
      },
      {
        pm: 4,
        pmval: rbcDB.value + g1.value - lrfval4.value,
        lrf: 4,
        lrfval: lrfval4.value
      },
      {
        pm: 5,
        pmval: rbcDB.value + g1.value - lrfval5.value,
        lrf: 5,
        lrfval: lrfval5.value
      },
      {
        pm: 6,
        pmval: rbcDB.value + g1.value - lrfval6.value,
        lrf: 6,
        lrfval: lrfval6.value
      },
      {
        pm: 7,
        pmval: rbcDB.value + g1.value - lrfval7.value,
        lrf: 7,
        lrfval: lrfval7.value
      }
    ])


    const saveProperty = () => {
      rbc.value = _rbc.value
      g1.value = _g1.value
      h1.value = _h1.value
      h2.value = _h2.value
      y.value = _y.value
      dh.value = _dh.value
      f.value = _f.value
      nL.value = _nL.value
      rbcDB.value = _rbcDB.value
      chart.value.data.datasets[0].data = rowsComputedData.value.map(a => a.pmval)
      $q.notify({
        message: 'Обновлено!',
        type: 'positive'
      })
    }

    const $labels = [0, 5, 10, 15, 20, 25, 30, 35]
    const $data = () => {
      return {
        labels: $labels,
        datasets: [
          {
            label: 'Затухания',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: rowsComputedData.value.map(a => a.pmval)
          }
        ]
      }
    }

    const $conf = {
      type: 'line',
      data: $data()
    }

    onMounted(() => {
      const $ctx = document.getElementById('chart')
      chart.value = new Chart($ctx, $conf)
      firebase('modelHata').then(snapshot => {
        dh.value = _dh.value = snapshot.dh
        f.value = _f.value = snapshot.f
        g1.value = _g1.value = snapshot.g1
        h1.value = _h1.value = snapshot.h1
        h2.value = _h2.value = snapshot.h2
        nL.value = _nL.value = snapshot.nL
        rbc.value = _rbc.value = snapshot.rbc
        rbcDB.value = _rbcDB.value = snapshot.rbcDB
        y.value = _y.value = snapshot.y
        saveProperty()
      }).catch(error => {
        $q.notify({
          message: error.message,
          type: 'negative'
        })
      })
    })

    return {
      rowsDefaultData,
      columnsDefaultData,
      columnsComputedData,
      rowsComputedData,
      rbc,
      g1,
      h1,
      h2,
      y,
      dh,
      f,
      nL,
      rbcDB,
      _rbc,
      _g1,
      _h1,
      _h2,
      _y,
      _dh,
      _f,
      _nL,
      _rbcDB,
      dataDialog,
      maximizedToggle,
      saveProperty
    }
  },
}
</script>
